import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { deleteMenuImage } from '$lib/utils/imageUpload';

export const eventiStore = writable([]);
export const eventiLoading = writable(true);
export const eventiError = writable(null);

// Carica tutti gli eventi
export async function loadEventi() {
    eventiLoading.set(true);
    eventiError.set(null);
    try {
        const { data, error } = await supabase
            .from('eventi')
            .select('*')
            .order('data_inizio', { ascending: false });
        
        if (error) throw error;
        eventiStore.set(data || []);
    } catch (error) {
        console.error('Error loading eventi:', error);
        eventiError.set(error.message);
    } finally {
        eventiLoading.set(false);
    }
}

// Carica solo eventi attivi (pubblicati e non terminati)
export async function loadEventiAttivi() {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('eventi')
            .select('*')
            .lte('data_inizio', now) // pubblicato
            .gte('data_fine', now)   // non terminato
            .order('data_inizio', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error loading eventi attivi:', error);
        return [];
    }
}

// Aggiungi evento
export async function addEvento(evento) {
    try {
        const { data, error } = await supabase
            .from('eventi')
            .insert([evento])
            .select()
            .single();
        
        if (error) throw error;
        await loadEventi();
        return { success: true, data };
    } catch (error) {
        console.error('Error adding evento:', error);
        return { success: false, error: error.message };
    }
}

// Aggiorna evento
export async function updateEvento(id, updates) {
    try {
        // Se l'update rimuove/cambia l'immagine, elimina la vecchia da storage
        if (updates.hasOwnProperty('immagine_url')) {
            const eventi = get(eventiStore);
            const evento = eventi.find(e => e.id === id);
            
            // Se l'evento aveva un'immagine e ora viene rimossa o cambiata
            if (evento && evento.immagine_url && evento.immagine_url !== updates.immagine_url) {
                await deleteMenuImage(evento.immagine_url);
            }
        }

        const { data, error } = await supabase
            .from('eventi')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        await loadEventi();
        return { success: true, data };
    } catch (error) {
        console.error('Error updating evento:', error);
        return { success: false, error: error.message };
    }
}

// Elimina evento
export async function deleteEvento(id) {
    try {
        // Prima recupera l'evento per eliminare l'immagine se presente
        const eventi = get(eventiStore);
        const evento = eventi.find(e => e.id === id);
        
        // Elimina l'immagine da storage se presente
        if (evento && evento.immagine_url) {
            await deleteMenuImage(evento.immagine_url);
        }

        // Elimina il record dal database
        const { error } = await supabase
            .from('eventi')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        await loadEventi();
        return { success: true };
    } catch (error) {
        console.error('Error deleting evento:', error);
        return { success: false, error: error.message };
    }
}

// Verifica se evento è attivo
export function isEventoAttivo(evento) {
    const now = new Date();
    const inizio = new Date(evento.data_inizio);
    const fine = new Date(evento.data_fine);
    
    return now >= inizio && now <= fine;
}

