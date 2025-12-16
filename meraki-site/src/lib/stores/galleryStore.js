import { writable, get, derived } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { browser } from '$app/environment';

// Store per le immagini della gallery
export const galleryStore = writable([]);
export const galleryLoading = writable(false);

// Store per i temi
export const themesStore = writable([]);
export const themesLoading = writable(false);

// Derived store: immagini raggruppate per tema
export const galleryByTheme = derived(
	[galleryStore, themesStore],
	([$galleryStore, $themesStore]) => {
		const grouped = {};
		
		// Inizializza con tutti i temi
		$themesStore.forEach(theme => {
			grouped[theme.id] = {
				theme,
				images: []
			};
		});
		
		// Aggiungi immagini senza tema
		grouped['uncategorized'] = {
			theme: { id: null, nome: 'Senza Tema', slug: 'senza-tema', ordine: 999 },
			images: []
		};
		
		// Raggruppa le immagini
		$galleryStore.forEach(image => {
			if (image.theme_id && grouped[image.theme_id]) {
				grouped[image.theme_id].images.push(image);
			} else {
				grouped['uncategorized'].images.push(image);
			}
		});
		
		// Converti in array e ordina per ordine tema
		return Object.values(grouped)
			.filter(g => g.images.length > 0)
			.sort((a, b) => a.theme.ordine - b.theme.ordine);
	}
);

// Auto-carica gallery e temi quando lo store viene importato (solo lato browser)
if (browser) {
	loadThemes();
	loadGallery();
}

// ============ THEMES FUNCTIONS ============

/**
 * Carica tutti i temi della gallery
 */
export async function loadThemes() {
	themesLoading.set(true);
	try {
		const { data, error } = await supabase
			.from('gallery_themes')
			.select('*')
			.order('ordine', { ascending: true });

		if (error) throw error;

		themesStore.set(data || []);
	} catch (error) {
		console.error('Errore caricamento temi:', error);
		themesStore.set([]);
	} finally {
		themesLoading.set(false);
	}
}

/**
 * Aggiunge un nuovo tema
 */
export async function addTheme(nome, descrizione = '') {
	try {
		const currentThemes = get(themesStore);
		const maxOrdine = currentThemes.length > 0 
			? Math.max(...currentThemes.map(t => t.ordine)) 
			: 0;
		
		// Genera slug dal nome
		const slug = nome.toLowerCase()
			.replace(/[àáâãäå]/g, 'a')
			.replace(/[èéêë]/g, 'e')
			.replace(/[ìíîï]/g, 'i')
			.replace(/[òóôõö]/g, 'o')
			.replace(/[ùúûü]/g, 'u')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const { data, error } = await supabase
			.from('gallery_themes')
			.insert([{
				nome,
				slug,
				descrizione,
				ordine: maxOrdine + 1
			}])
			.select()
			.single();

		if (error) throw error;

		themesStore.update(items => [...items, data]);
		return { success: true, data };
	} catch (error) {
		console.error('Errore aggiunta tema:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna un tema
 */
export async function updateTheme(id, updates) {
	try {
		// Se si sta aggiornando il nome, aggiorna anche lo slug
		if (updates.nome) {
			updates.slug = updates.nome.toLowerCase()
				.replace(/[àáâãäå]/g, 'a')
				.replace(/[èéêë]/g, 'e')
				.replace(/[ìíîï]/g, 'i')
				.replace(/[òóôõö]/g, 'o')
				.replace(/[ùúûü]/g, 'u')
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}

		const { error } = await supabase
			.from('gallery_themes')
			.update({ ...updates, updated_at: new Date().toISOString() })
			.eq('id', id);

		if (error) throw error;

		themesStore.update(items =>
			items.map(item =>
				item.id === id ? { ...item, ...updates } : item
			)
		);
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento tema:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Elimina un tema (le foto rimarranno senza tema)
 */
export async function deleteTheme(id) {
	try {
		const { error } = await supabase
			.from('gallery_themes')
			.delete()
			.eq('id', id);

		if (error) throw error;

		themesStore.update(items => items.filter(item => item.id !== id));
		
		// Aggiorna le immagini che avevano questo tema
		galleryStore.update(items =>
			items.map(item =>
				item.theme_id === id ? { ...item, theme_id: null } : item
			)
		);
		
		return { success: true };
	} catch (error) {
		console.error('Errore eliminazione tema:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna l'ordine dei temi
 */
export async function updateThemesOrder(newOrder) {
	try {
		// Usa transazione batch per aggiornare
		for (let i = 0; i < newOrder.length; i++) {
			const { error } = await supabase
				.from('gallery_themes')
				.update({ ordine: i + 1 })
				.eq('id', newOrder[i].id);
			
			if (error) throw error;
		}

		// Aggiorna lo store con il nuovo ordine
		const updatedThemes = newOrder.map((theme, index) => ({
			...theme,
			ordine: index + 1
		}));
		themesStore.set(updatedThemes);
		
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento ordine temi:', error);
		return { success: false, error: error.message };
	}
}

// ============ GALLERY FUNCTIONS ============

/**
 * Carica tutte le immagini della gallery dal database
 */
export async function loadGallery() {
	galleryLoading.set(true);
	try {
		const { data, error } = await supabase
			.from('gallery')
			.select('*, gallery_themes(nome, slug)')
			.order('ordine', { ascending: true });

		if (error) throw error;

		galleryStore.set(data || []);
	} catch (error) {
		console.error('Errore caricamento gallery:', error);
		galleryStore.set([]);
	} finally {
		galleryLoading.set(false);
	}
}

/**
 * Aggiunge una nuova immagine alla gallery
 */
export async function addGalleryImage(imageUrl, alt = '', themeId = null) {
	try {
		const currentGallery = get(galleryStore);
		const maxOrdine = currentGallery.length > 0 
			? Math.max(...currentGallery.map(img => img.ordine)) 
			: 0;

		const { data, error } = await supabase
			.from('gallery')
			.insert([{
				immagine_url: imageUrl,
				alt_text: alt,
				theme_id: themeId,
				ordine: maxOrdine + 1
			}])
			.select('*, gallery_themes(nome, slug)')
			.single();

		if (error) throw error;

		galleryStore.update(items => [...items, data]);
		return { success: true, data };
	} catch (error) {
		console.error('Errore aggiunta immagine:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Elimina un'immagine dalla gallery
 */
export async function deleteGalleryImage(id) {
	try {
		const { error } = await supabase
			.from('gallery')
			.delete()
			.eq('id', id);

		if (error) throw error;

		galleryStore.update(items => items.filter(item => item.id !== id));
		return { success: true };
	} catch (error) {
		console.error('Errore eliminazione immagine:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna l'ordine delle immagini - FIX: usa UPDATE singoli invece di upsert
 */
export async function updateGalleryOrder(newOrder) {
	try {
		// Usa UPDATE singoli per ogni immagine
		for (let i = 0; i < newOrder.length; i++) {
			const { error } = await supabase
				.from('gallery')
				.update({ ordine: i + 1 })
				.eq('id', newOrder[i].id);
			
			if (error) throw error;
		}

		// Aggiorna lo store con il nuovo ordine
		const updatedItems = newOrder.map((item, index) => ({
			...item,
			ordine: index + 1
		}));
		galleryStore.set(updatedItems);
		
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento ordine:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna alt text di un'immagine
 */
export async function updateGalleryAltText(id, altText) {
	try {
		const { error } = await supabase
			.from('gallery')
			.update({ alt_text: altText })
			.eq('id', id);

		if (error) throw error;

		galleryStore.update(items =>
			items.map(item =>
				item.id === id ? { ...item, alt_text: altText } : item
			)
		);
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento alt text:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna il tema di un'immagine
 */
export async function updateImageTheme(id, themeId) {
	try {
		const { data, error } = await supabase
			.from('gallery')
			.update({ theme_id: themeId })
			.eq('id', id)
			.select('*, gallery_themes(nome, slug)')
			.single();

		if (error) throw error;

		galleryStore.update(items =>
			items.map(item =>
				item.id === id ? data : item
			)
		);
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento tema immagine:', error);
		return { success: false, error: error.message };
	}
}
