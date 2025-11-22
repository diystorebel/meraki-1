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
			.order('id', { ascending: true });

		if (error) throw error;

		categoriesStore.set(data || []);
	} catch (error) {
		console.error('Error loading categories:', error);
		categoriesError.set(error.message);
	} finally {
		categoriesLoading.set(false);
	}
}

// Add category
export async function addCategory(name) {
	try {
		const { data, error } = await supabase
			.from('categories')
			.insert([{ name, subcategories: [] }])
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
