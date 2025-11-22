import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

// Auth state store
export const authUser = writable(null);
export const isAuthenticated = writable(false);
export const authLoading = writable(true);

// Initialize auth state
export async function initAuth() {
	authLoading.set(true);
	
	try {
		// Get current session
		const { data: { session } } = await supabase.auth.getSession();
		
		if (session?.user) {
			authUser.set(session.user);
			isAuthenticated.set(true);
		} else {
			authUser.set(null);
			isAuthenticated.set(false);
		}
	} catch (error) {
		console.error('Error initializing auth:', error);
		authUser.set(null);
		isAuthenticated.set(false);
	} finally {
		authLoading.set(false);
	}

	// Listen for auth changes
	supabase.auth.onAuthStateChange((event, session) => {
		if (session?.user) {
			authUser.set(session.user);
			isAuthenticated.set(true);
		} else {
			authUser.set(null);
			isAuthenticated.set(false);
		}
	});
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function login(email, password) {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;

		authUser.set(data.user);
		isAuthenticated.set(true);
		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Logout current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function logout() {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) throw error;

		authUser.set(null);
		isAuthenticated.set(false);
		return { success: true };
	} catch (error) {
		console.error('Logout error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Sign up new user (admin registration)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, error?: string, data?: any}>}
 */
export async function signUp(email, password) {
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) throw error;

		return { success: true, data };
	} catch (error) {
		console.error('Sign up error:', error);
		return { success: false, error: error.message };
	}
}
