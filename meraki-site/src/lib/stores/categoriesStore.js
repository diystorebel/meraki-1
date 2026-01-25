import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

// Store for categories
export const categoriesStore = writable([]);
export const categoriesLoading = writable(true);
export const categoriesError = writable(null);

// Load categories from Supabase
export async function loadCategories() {
	categoriesLoading.set(true);
	categoriesError.set(null);
	
	try {
		const { data, error } = await supabase
			.from('categories')
			.select('*')
			.order('display_order', { ascending: true });

		if (error) throw error;

		categoriesStore.set(data || []);
	} catch (error) {
		console.error('Error loading categories:', error);
		categoriesError.set(error.message);
	} finally {
		categoriesLoading.set(false);
	}
}

// Macro categories enum values
export const MACRO_CATEGORIES = [
	{ id: 'drink', name: 'Drinks', icon: '/immagini-categorie/cocktail.png' },
	{ id: 'wines', name: 'Birre e Vini', icon: '/immagini-categorie/birre-vini.png' },
	{ id: 'kitchen', name: 'Cucina', icon: '/immagini-categorie/cibo.png' }
];

// Add category
export async function addCategory(name, macroCategory = null) {
	try {
		const { data, error } = await supabase
			.from('categories')
			.insert([{ name, subcategories: [], macro_category: macroCategory }])
			.select()
			.single();

		if (error) throw error;

		categoriesStore.update(cats => [...cats, data]);
		return { success: true, data };
	} catch (error) {
		console.error('Error adding category:', error);
		return { success: false, error: error.message };
	}
}

// Update category
export async function updateCategory(id, updates) {
	try {
		const { data, error } = await supabase
			.from('categories')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		categoriesStore.update(cats =>
			cats.map(cat => cat.id === id ? data : cat)
		);
		return { success: true, data };
	} catch (error) {
		console.error('Error updating category:', error);
		return { success: false, error: error.message };
	}
}

// Delete category
export async function deleteCategory(id) {
	try {
		const { error } = await supabase
			.from('categories')
			.delete()
			.eq('id', id);

		if (error) throw error;

		categoriesStore.update(cats => cats.filter(cat => cat.id !== id));
		return { success: true };
	} catch (error) {
		console.error('Error deleting category:', error);
		return { success: false, error: error.message };
	}
}

// Add subcategory to category
export async function addSubcategory(categoryId, subcategoryName) {
	try {
		// Get current category
		const { data: category, error: fetchError } = await supabase
			.from('categories')
			.select('subcategories')
			.eq('id', categoryId)
			.single();

		if (fetchError) throw fetchError;

		const newSubcategories = [...(category.subcategories || []), subcategoryName];

		// Update with new subcategory
		const { data, error } = await supabase
			.from('categories')
			.update({ subcategories: newSubcategories })
			.eq('id', categoryId)
			.select()
			.single();

		if (error) throw error;

		categoriesStore.update(cats =>
			cats.map(cat => cat.id === categoryId ? data : cat)
		);
		return { success: true, data };
	} catch (error) {
		console.error('Error adding subcategory:', error);
		return { success: false, error: error.message };
	}
}

// Remove subcategory from category
export async function removeSubcategory(categoryId, subcategoryName) {
	try {
		// Get current category
		const { data: category, error: fetchError } = await supabase
			.from('categories')
			.select('subcategories')
			.eq('id', categoryId)
			.single();

		if (fetchError) throw fetchError;

		const newSubcategories = (category.subcategories || [])
			.filter(s => s !== subcategoryName);

		// Update with removed subcategory
		const { data, error } = await supabase
			.from('categories')
			.update({ subcategories: newSubcategories })
			.eq('id', categoryId)
			.select()
			.single();

		if (error) throw error;

		categoriesStore.update(cats =>
			cats.map(cat => cat.id === categoryId ? data : cat)
		);
		return { success: true, data };
	} catch (error) {
		console.error('Error removing subcategory:', error);
		return { success: false, error: error.message };
	}
}

// Helper function
export function getSubcategoriesForCategory(categories, categoryName) {
	const cat = categories.find(c => c.name === categoryName);
	return cat ? cat.subcategories : [];
}

// Move category up/down
export async function moveCategoryOrder(categoryId, direction) {
	try {
		let categories = [];
		categoriesStore.subscribe(cats => categories = [...cats])();
		
		const currentIndex = categories.findIndex(c => c.id === categoryId);
		if (currentIndex === -1) return { success: false, error: 'Categoria non trovata' };
		
		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= categories.length) return { success: false, error: 'Impossibile spostare' };
		
		// Swap display_order values
		const currentCat = categories[currentIndex];
		const targetCat = categories[newIndex];
		
		const currentOrder = currentCat.display_order;
		const targetOrder = targetCat.display_order;
		
		// Update both categories
		const { error: error1 } = await supabase
			.from('categories')
			.update({ display_order: targetOrder })
			.eq('id', currentCat.id);
			
		const { error: error2 } = await supabase
			.from('categories')
			.update({ display_order: currentOrder })
			.eq('id', targetCat.id);
		
		if (error1 || error2) throw error1 || error2;
		
		// Update local store
		categories[currentIndex] = { ...currentCat, display_order: targetOrder };
		categories[newIndex] = { ...targetCat, display_order: currentOrder };
		categories.sort((a, b) => a.display_order - b.display_order);
		categoriesStore.set(categories);
		
		return { success: true };
	} catch (error) {
		console.error('Error moving category:', error);
		return { success: false, error: error.message };
	}
}

// Reorder subcategories
export async function reorderSubcategories(categoryId, newSubcategoriesOrder) {
	try {
		const { data, error } = await supabase
			.from('categories')
			.update({ subcategories: newSubcategoriesOrder })
			.eq('id', categoryId)
			.select()
			.single();
		
		if (error) throw error;
		
		categoriesStore.update(cats =>
			cats.map(cat => cat.id === categoryId ? data : cat)
		);
		return { success: true, data };
	} catch (error) {
		console.error('Error reordering subcategories:', error);
		return { success: false, error: error.message };
	}
}
