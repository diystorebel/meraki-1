import imageCompression from 'browser-image-compression';
import { supabase } from '$lib/supabaseClient';

/**
 * Compress and upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} fileName - Name for the file (will overwrite if exists)
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export async function uploadMenuImage(file, fileName) {
	try {
		// Compression options - più aggressive per eventi
		const options = {
			maxSizeMB: 0.3, // Ridotto da 0.5 a 0.3 (300KB max)
			maxWidthOrHeight: 1200, // Ridotto da 1920 a 1200 per popup
			useWebWorker: true,
			fileType: 'image/webp', // Convert to WebP for best compression
			initialQuality: 0.8, // Qualità iniziale più bassa
		};

		// Compress image
		const compressedFile = await imageCompression(file, options);
		
		// Generate WebP filename (supports jpg, png, heic/heif iPhone, gif, avif, bmp, tiff)
		const webpFileName = fileName.replace(/\.(jpg|jpeg|png|heic|heif|gif|avif|bmp|tiff|tif|webp)$/i, '.webp');
		const filePath = `${webpFileName}`;

		// Upload to Supabase Storage (upsert = true to overwrite)
		const { data, error } = await supabase.storage
			.from('menu-images')
			.upload(filePath, compressedFile, {
				cacheControl: '3600',
				upsert: true, // Overwrite if exists
			});

		if (error) {
			console.error('Upload error:', error);
			return { url: null, error: error.message };
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from('menu-images')
			.getPublicUrl(filePath);

		return { url: publicUrl, error: null };
	} catch (error) {
		console.error('Image processing error:', error);
		return { url: null, error: error.message };
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
		// Compression options for gallery images
		const options = {
			maxSizeMB: 1, // Slightly larger for gallery
			maxWidthOrHeight: 2400,
			useWebWorker: true,
			fileType: 'image/webp',
		};

		// Compress image
		const compressedFile = await imageCompression(file, options);
		
		// Generate WebP filename (supports jpg, png, heic/heif iPhone, gif, avif, bmp, tiff)
		const webpFileName = fileName.replace(/\.(jpg|jpeg|png|heic|heif|gif|avif|bmp|tiff|tif|webp)$/i, '.webp');
		const filePath = `${webpFileName}`;

		// Upload to Supabase Storage gallery bucket
		const { data, error } = await supabase.storage
			.from('gallery')
			.upload(filePath, compressedFile, {
				cacheControl: '3600',
				upsert: true,
			});

		if (error) {
			console.error('Upload error:', error);
			return { url: null, error: error.message };
		}

		// Get public URL
		const { data: { publicUrl } } = supabase.storage
			.from('gallery')
			.getPublicUrl(filePath);

		return { url: publicUrl, error: null };
	} catch (error) {
		console.error('Gallery image processing error:', error);
		return { url: null, error: error.message };
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

