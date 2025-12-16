/**
 * Converte un'immagine in WebP ottimizzato
 * @param {File} file - File immagine da convertire
 * @param {Object} options - Opzioni di conversione
 * @returns {Promise<string>} - Base64 string dell'immagine WebP
 */
export async function convertToWebP(file, options = {}) {
	const {
		maxWidth = 1200,
		maxHeight = 1200,
		quality = 0.8
	} = options;

	return new Promise((resolve, reject) => {
		// Validazione tipo file
		if (!file.type.startsWith('image/')) {
			reject(new Error('Il file deve essere un\'immagine'));
			return;
		}

		const reader = new FileReader();
		
		reader.onload = (e) => {
			const img = new Image();
			
			img.onload = () => {
				// Calcola dimensioni mantenendo aspect ratio
				let width = img.width;
				let height = img.height;
				
				if (width > maxWidth || height > maxHeight) {
					const aspectRatio = width / height;
					
					if (width > height) {
						width = maxWidth;
						height = maxWidth / aspectRatio;
					} else {
						height = maxHeight;
						width = maxHeight * aspectRatio;
					}
				}
				
				// Crea canvas per conversione
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				
				const ctx = canvas.getContext('2d');
				
				// Disegna immagine ridimensionata
				ctx.drawImage(img, 0, 0, width, height);
				
				// Converti in WebP
				try {
					const webpDataUrl = canvas.toDataURL('image/webp', quality);
					
					// Verifica supporto WebP
					if (webpDataUrl.indexOf('data:image/webp') !== 0) {
						// Fallback a JPEG se WebP non supportato
						const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
						resolve(jpegDataUrl);
					} else {
						resolve(webpDataUrl);
					}
				} catch (error) {
					reject(new Error('Errore durante la conversione: ' + error.message));
				}
			};
			
			img.onerror = () => {
				reject(new Error('Errore nel caricamento dell\'immagine'));
			};
			
			img.src = e.target.result;
		};
		
		reader.onerror = () => {
			reject(new Error('Errore nella lettura del file'));
		};
		
		reader.readAsDataURL(file);
	});
}

/**
 * Ottiene info su dimensione e formato immagine
 * @param {string} base64String - Stringa base64 dell'immagine
 * @returns {Object} - Info immagine (size, format)
 */
export function getImageInfo(base64String) {
	if (!base64String) return null;
	
	// Estrai formato
	const matches = base64String.match(/^data:image\/([a-z]+);base64,/);
	const format = matches ? matches[1] : 'unknown';
	
	// Calcola dimensione approssimativa in KB
	const base64Length = base64String.length - (base64String.indexOf(',') + 1);
	const padding = (base64String.charAt(base64String.length - 2) === '=') ? 2 : 
	                (base64String.charAt(base64String.length - 1) === '=') ? 1 : 0;
	const sizeInBytes = (base64Length * 3 / 4) - padding;
	const sizeInKB = Math.round(sizeInBytes / 1024);
	
	return {
		format,
		sizeKB: sizeInKB,
		sizeMB: (sizeInKB / 1024).toFixed(2)
	};
}

/**
 * Confronta due immagini per vedere se sono diverse
 * @param {string} img1 - Prima immagine (base64)
 * @param {string} img2 - Seconda immagine (base64)
 * @returns {boolean} - true se sono diverse
 */
export function areImagesDifferent(img1, img2) {
	if (!img1 && !img2) return false;
	if (!img1 || !img2) return true;
	return img1 !== img2;
}

