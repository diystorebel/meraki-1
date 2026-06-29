import imageCompression from 'browser-image-compression';
import { supabase } from '$lib/supabaseClient';

/**
 * Comprime un'immagine in modo resiliente.
 * Catena di fallback pensata per Android (worker bloccati nei browser in-app,
 * foto ad altissima risoluzione che mandano in OOM il canvas):
 *  1) tentativo con Web Worker
 *  2) tentativo senza Web Worker (browser in-app, worker non disponibili)
 *  3) ultima spiaggia: carica il file originale così com'è (meglio pesante che niente)
 *
 * @param {File} file
 * @param {Object} options - opzioni base per browser-image-compression (senza useWebWorker)
 * @returns {Promise<{blob: Blob, ext: string, contentType: string}>}
 */
async function compressForUpload(file, options) {
	// 1) tentativo principale con web worker
	try {
		const out = await imageCompression(file, { ...options, useWebWorker: true });
		if (out && out.size > 0) {
			return { blob: out, ext: 'webp', contentType: 'image/webp' };
		}
		console.warn('[compressForUpload] worker ha prodotto un file vuoto, fallback');
	} catch (e) {
		console.warn('[compressForUpload] tentativo con worker fallito:', e?.message ?? e);
	}

	// 2) retry senza web worker (tipico browser in-app Android)
	try {
		const out = await imageCompression(file, { ...options, useWebWorker: false });
		if (out && out.size > 0) {
			return { blob: out, ext: 'webp', contentType: 'image/webp' };
		}
		console.warn('[compressForUpload] no-worker ha prodotto un file vuoto, fallback');
	} catch (e) {
		console.warn('[compressForUpload] tentativo no-worker fallito:', e?.message ?? e);
	}

	// 3) ultima spiaggia: carica l'originale mantenendo estensione e content-type reali
	const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
	return {
		blob: file,
		ext: ext === 'heic' || ext === 'heif' ? 'jpg' : ext,
		contentType: file.type || 'application/octet-stream'
	};
}

/** Sostituisce l'estensione del filename con quella effettiva del blob caricato. */
function withExtension(fileName, ext) {
	const base = fileName.replace(/\.(jpg|jpeg|png|heic|heif|gif|avif|bmp|tiff|tif|webp)$/i, '');
	return `${base}.${ext}`;
}

/**
 * Compress and upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} fileName - Name for the file (will overwrite if exists)
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export async function uploadMenuImage(file, fileName) {
	try {
		// Qualità: leggera ma nitida (popup/card menu). 1600px max, fino a ~0.6MB.
		const options = {
			maxSizeMB: 0.6,
			maxWidthOrHeight: 1600,
			initialQuality: 0.82,
			fileType: 'image/webp'
		};

		console.log(`[uploadMenuImage] start — name=${file.name} size=${file.size} type=${file.type}`);
		const { blob, ext, contentType } = await compressForUpload(file, options);
		console.log(`[uploadMenuImage] compressed — size=${blob.size} ext=${ext}`);

		const filePath = withExtension(fileName, ext);

		const { error } = await supabase.storage
			.from('menu-images')
			.upload(filePath, blob, {
				cacheControl: '3600',
				upsert: true,
				contentType
			});

		if (error) {
			console.error('Upload error:', error);
			return { url: null, error: error.message };
		}

		const { data: { publicUrl } } = supabase.storage
			.from('menu-images')
			.getPublicUrl(filePath);

		return { url: publicUrl, error: null };
	} catch (error) {
		console.error('Image processing error:', error);
		return { url: null, error: error?.message ?? String(error) ?? 'Errore sconosciuto durante il processing' };
	}
}

/**
 * Delete image from Supabase Storage
 * @param {string} fileUrl - Full URL or path of the file
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function deleteMenuImage(fileUrl) {
	try {
		// Extract file path from URL
		const url = new URL(fileUrl);
		const pathParts = url.pathname.split('/');
		const fileName = pathParts[pathParts.length - 1];

		const { error } = await supabase.storage
			.from('menu-images')
			.remove([fileName]);

		if (error) {
			console.error('Delete error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Image deletion error:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Upload image to gallery bucket
 * @param {File} file - Image file to upload
 * @param {string} fileName - Name for the file
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export async function uploadGalleryImage(file, fileName) {
	try {
		// Gallery: qualità più alta (immagini a tutto schermo). 2400px max, fino a ~1MB.
		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 2400,
			initialQuality: 0.82,
			fileType: 'image/webp'
		};

		console.log(`[uploadGalleryImage] start — name=${file.name} size=${file.size} type=${file.type}`);
		const { blob, ext, contentType } = await compressForUpload(file, options);
		console.log(`[uploadGalleryImage] compressed — size=${blob.size} ext=${ext}`);

		const filePath = withExtension(fileName, ext);

		const { error } = await supabase.storage
			.from('gallery')
			.upload(filePath, blob, {
				cacheControl: '3600',
				upsert: true,
				contentType
			});

		if (error) {
			console.error('Upload error:', error);
			return { url: null, error: error.message };
		}

		const { data: { publicUrl } } = supabase.storage
			.from('gallery')
			.getPublicUrl(filePath);

		return { url: publicUrl, error: null };
	} catch (error) {
		console.error('Gallery image processing error:', error);
		return { url: null, error: error?.message ?? String(error) ?? 'Errore sconosciuto durante il processing' };
	}
}

/**
 * Delete image from gallery bucket
 * @param {string} fileUrl - Full URL or path of the file
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function deleteGalleryImage(fileUrl) {
	try {
		// Extract file path from URL
		const url = new URL(fileUrl);
		const pathParts = url.pathname.split('/');
		const fileName = pathParts[pathParts.length - 1];

		const { error } = await supabase.storage
			.from('gallery')
			.remove([fileName]);

		if (error) {
			console.error('Delete error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Gallery image deletion error:', error);
		return { success: false, error: error.message };
	}
}
