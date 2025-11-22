import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const galleryStore = writable([]);
export const galleryLoading = writable(false);

/**
 * Carica tutte le immagini della gallery dal database
 */
export async function loadGallery() {
	galleryLoading.set(true);
	try {
		const { data, error } = await supabase
			.from('gallery')
			.select('*')
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
 * @param {string} imageUrl - URL dell'immagine
 * @param {string} alt - Testo alternativo
 */
export async function addGalleryImage(imageUrl, alt = '') {
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
				ordine: maxOrdine + 1
			}])
			.select()
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
 * @param {number} id - ID dell'immagine
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
 * Aggiorna l'ordine delle immagini
 * @param {Array} newOrder - Array di immagini nel nuovo ordine
 */
export async function updateGalleryOrder(newOrder) {
	try {
		// Aggiorna l'ordine di tutte le immagini
		const updates = newOrder.map((item, index) => ({
			id: item.id,
			ordine: index + 1
		}));

		const { error } = await supabase
			.from('gallery')
			.upsert(updates);

		if (error) throw error;

		galleryStore.set(newOrder);
		return { success: true };
	} catch (error) {
		console.error('Errore aggiornamento ordine:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Aggiorna alt text di un'immagine
 * @param {number} id - ID dell'immagine
 * @param {string} altText - Nuovo alt text
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

