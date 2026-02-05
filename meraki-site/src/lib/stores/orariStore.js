import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const orariStore = writable([]);
export const orariLoading = writable(false);

const GIORNI_SETTIMANA = [
	{ id: 1, nome: 'Lunedì' },
	{ id: 2, nome: 'Martedì' },
	{ id: 3, nome: 'Mercoledì' },
	{ id: 4, nome: 'Giovedì' },
	{ id: 5, nome: 'Venerdì' },
	{ id: 6, nome: 'Sabato' },
	{ id: 7, nome: 'Domenica' }
];

export async function loadOrari() {
	orariLoading.set(true);
	try {
		const { data, error } = await supabase
			.from('orari_apertura')
			.select('*')
			.order('giorno_settimana', { ascending: true });

		if (error) throw error;

		// Se non ci sono orari, crea struttura default
		if (!data || data.length === 0) {
			const defaultOrari = GIORNI_SETTIMANA.map(g => ({
				giorno_settimana: g.id,
				giorno_nome: g.nome,
				pranzo_inizio: null,
				pranzo_fine: null,
				sera_inizio: null,
				sera_fine: null,
				chiuso: false
			}));
			orariStore.set(defaultOrari);
		} else {
			// Aggiungi nome giorno ai dati
			const orariConNome = data.map(o => ({
				...o,
				giorno_nome: GIORNI_SETTIMANA.find(g => g.id === o.giorno_settimana)?.nome || ''
			}));
			orariStore.set(orariConNome);
		}
	} catch (err) {
		console.error('Errore caricamento orari:', err);
		throw err;
	} finally {
		orariLoading.set(false);
	}
}

export async function updateOrario(giorno_settimana, orarioData) {
	try {
		// Rimuovi giorno_nome che non esiste nella tabella DB
		const { giorno_nome, ...dataToSave } = orarioData;
		
		const { data, error } = await supabase
			.from('orari_apertura')
			.upsert({
				giorno_settimana,
				...dataToSave,
				updated_at: new Date().toISOString()
			}, {
				onConflict: 'giorno_settimana'
			})
			.select()
			.single();

		if (error) throw error;

		// Aggiorna store
		orariStore.update(orari => {
			const index = orari.findIndex(o => o.giorno_settimana === giorno_settimana);
			const giornoNome = GIORNI_SETTIMANA.find(g => g.id === giorno_settimana)?.nome || '';
			
			if (index >= 0) {
				orari[index] = { ...data, giorno_nome: giornoNome };
			} else {
				orari.push({ ...data, giorno_nome: giornoNome });
			}
			return orari.sort((a, b) => a.giorno_settimana - b.giorno_settimana);
		});

		return data;
	} catch (err) {
		console.error('Errore aggiornamento orario:', err);
		throw err;
	}
}

export async function deleteOrario(giorno_settimana) {
	try {
		const { error } = await supabase
			.from('orari_apertura')
			.delete()
			.eq('giorno_settimana', giorno_settimana);

		if (error) throw error;

		// Aggiorna store
		orariStore.update(orari => orari.filter(o => o.giorno_settimana !== giorno_settimana));
	} catch (err) {
		console.error('Errore eliminazione orario:', err);
		throw err;
	}
}

export function getGiorniSettimana() {
	return GIORNI_SETTIMANA;
}
