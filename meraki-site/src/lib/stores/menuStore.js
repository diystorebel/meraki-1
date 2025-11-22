import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { deleteMenuImage } from '$lib/utils/imageUpload';

// Store for menu items
export const menuStore = writable([]);
export const menuLoading = writable(true);
export const menuError = writable(null);

// Load menu items from Supabase
export async function loadMenu() {
	menuLoading.set(true);
	menuError.set(null);
	
	try {
		const { data, error } = await supabase
			.from('menu_items')
			.select('*')
			.order('sort_order', { ascending: true });

		if (error) throw error;

		menuStore.set(data || []);
	} catch (error) {
		console.error('Error loading menu:', error);
		menuError.set(error.message);
	} finally {
		menuLoading.set(false);
	}
}

// Add menu item
export async function addMenuItem(item) {
	try {
		const { data, error } = await supabase
			.from('menu_items')
			.insert([item])
			.select()
			.single();

		if (error) throw error;

		menuStore.update(items => [...items, data]);
		return { success: true, data };
	} catch (error) {
		console.error('Error adding menu item:', error);
		return { success: false, error: error.message };
	}
}

// Update menu item
export async function updateMenuItem(id, updates) {
	try {
		// Se l'update rimuove/cambia l'immagine, elimina la vecchia da storage
		if (updates.hasOwnProperty('image_url')) {
			const items = get(menuStore);
			const item = items.find(i => i.id === id);
			
			// Se l'item aveva un'immagine e ora viene rimossa o cambiata
			if (item && item.image_url && item.image_url !== updates.image_url) {
				await deleteMenuImage(item.image_url);
			}
		}

		const { data, error } = await supabase
			.from('menu_items')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		menuStore.update(items =>
			items.map(item => item.id === id ? data : item)
		);
		return { success: true, data };
	} catch (error) {
		console.error('Error updating menu item:', error);
		return { success: false, error: error.message };
	}
}

// Delete menu item
export async function deleteMenuItem(id) {
	try {
		// Prima recupera l'item per eliminare l'immagine se presente
		const items = get(menuStore);
		const item = items.find(i => i.id === id);
		
		// Elimina l'immagine da storage se presente
		if (item && item.image_url) {
			await deleteMenuImage(item.image_url);
		}

		// Elimina il record dal database
		const { error } = await supabase
			.from('menu_items')
			.delete()
			.eq('id', id);

		if (error) throw error;

		menuStore.update(items => items.filter(item => item.id !== id));
		return { success: true };
	} catch (error) {
		console.error('Error deleting menu item:', error);
		return { success: false, error: error.message };
	}
}

// Toggle item availability
export async function toggleItemAvailability(id, isAvailable) {
	return await updateMenuItem(id, { is_available: isAvailable });
}

// Update item sort order
export async function updateSortOrder(id, sortOrder) {
	return await updateMenuItem(id, { sort_order: sortOrder });
}
