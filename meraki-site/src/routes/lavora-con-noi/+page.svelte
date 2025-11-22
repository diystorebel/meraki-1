<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	
	let nome = '';
	let cognome = '';
	let email = '';
	let telefono = '';
	let messaggio = '';
	let cvFile = null;
	let consenso = false;
	let loading = false;
	let successMessage = '';
	let errorMessage = '';
	let fileInputElement;

	// Validazione file (max 5MB, solo PDF e immagini)
	function handleFileChange(event) {
		const file = event.target.files[0];
		if (!file) {
			cvFile = null;
			return;
		}

		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

		if (!allowedTypes.includes(file.type)) {
			errorMessage = 'Formato non valido. Accettati: PDF, JPG, PNG';
			cvFile = null;
			event.target.value = '';
			return;
		}

		if (file.size > maxSize) {
			errorMessage = 'File troppo grande. Max 5MB';
			cvFile = null;
			event.target.value = '';
			return;
		}

		cvFile = file;
		errorMessage = '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		errorMessage = '';
		successMessage = '';

		// Validazione campi
		if (!nome.trim() || !cognome.trim() || !email.trim() || !telefono.trim() || !messaggio.trim()) {
			errorMessage = 'Compila tutti i campi obbligatori';
			return;
		}

		if (!cvFile) {
			errorMessage = 'Carica il tuo CV';
			return;
		}

		if (!consenso) {
			errorMessage = 'Devi autorizzare il trattamento dei dati';
			return;
		}

		loading = true;

		try {
			// Converti file in base64 per l'invio
			const fileBase64 = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result.split(',')[1]);
				reader.onerror = reject;
				reader.readAsDataURL(cvFile);
			});

			// Prepara dati per l'invio email
			const candidaturaData = {
				nome: nome.trim(),
				cognome: cognome.trim(),
				email: email.trim(),
				telefono: telefono.trim(),
				messaggio: messaggio.trim(),
				cv_filename: cvFile.name,
				cv_base64: fileBase64,
				cv_mimetype: cvFile.type
			};

			// Invio tramite Edge Function
			const response = await fetch('/api/send-candidatura', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(candidaturaData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Errore invio email');
			}

			// Salva candidatura nel database (senza CV)
			const { error: dbError } = await supabase
				.from('candidature')
				.insert({
					nome: nome.trim(),
					cognome: cognome.trim(),
					email: email.trim(),
					telefono: telefono.trim(),
					messaggio: messaggio.trim(),
					cv_filename: cvFile.name,
					consenso_privacy: true
				});

			if (dbError) {
				console.error('Database error:', dbError);
				// Non bloccare se il DB fallisce, l'email è già stata inviata
			}

			// Successo
			successMessage = '✓ Candidatura inviata con successo! Ti contatteremo presto.';
			
			// Reset form
			nome = '';
			cognome = '';
			email = '';
			telefono = '';
			messaggio = '';
			cvFile = null;
			consenso = false;
			if (fileInputElement) {
				fileInputElement.value = '';
			}

		} catch (err) {
			console.error('Errore invio:', err);
			errorMessage = 'Errore invio candidatura: ' + err.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Lavora con Noi - Meraki</title>
</svelte:head>

<div class="lavora-container">
	<div class="back-link">
		<a href="/">← Torna alla Home</a>
	</div>

	<div class="content-box">
		<h1>Lavora con Noi</h1>
		<p class="intro">Entra a far parte del team Meraki. Compila il form e carica il tuo CV.</p>

		<form on:submit={handleSubmit}>
			<div class="form-row">
				<div class="form-group">
					<label for="nome">Nome *</label>
					<input 
						type="text" 
						id="nome" 
						bind:value={nome} 
						required 
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="cognome">Cognome *</label>
					<input 
						type="text" 
						id="cognome" 
						bind:value={cognome} 
						required 
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="email">Email *</label>
					<input 
						type="email" 
						id="email" 
						bind:value={email} 
						required 
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="telefono">Telefono *</label>
					<input 
						type="tel" 
						id="telefono" 
						bind:value={telefono} 
						required 
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="messaggio">Messaggio *</label>
				<textarea 
					id="messaggio" 
					bind:value={messaggio} 
					rows="5" 
					required 
					disabled={loading}
					placeholder="Parlaci di te e perché vorresti lavorare con noi..."
				></textarea>
			</div>

			<div class="form-group">
				<label for="cv">Carica CV (PDF o Immagine - max 5MB) *</label>
				<input 
					type="file" 
					id="cv" 
					accept=".pdf,.jpg,.jpeg,.png"
					on:change={handleFileChange}
					bind:this={fileInputElement}
					required 
					disabled={loading}
				/>
				{#if cvFile}
					<span class="file-selected">✓ {cvFile.name}</span>
				{/if}
			</div>

			<div class="form-group checkbox-group">
				<label class="checkbox-label">
					<input 
						type="checkbox" 
						bind:checked={consenso} 
						required 
						disabled={loading}
					/>
					<span>Autorizzo al trattamento dei miei dati personali secondo la <a href="/privacy-policy" target="_blank">Privacy Policy</a> *</span>
				</label>
			</div>

			{#if errorMessage}
				<div class="message error-message">{errorMessage}</div>
			{/if}

			{#if successMessage}
				<div class="message success-message">{successMessage}</div>
			{/if}

			<button type="submit" class="submit-btn" disabled={loading}>
				{loading ? 'Invio in corso...' : 'Invia Candidatura'}
			</button>
		</form>
	</div>
</div>

<style>
	.lavora-container {
		min-height: 100vh;
		background: var(--grigio-chiaro);
		padding: 2rem 1rem;
	}

	.back-link {
		max-width: 800px;
		margin: 0 auto 1rem;
	}

	.back-link a {
		color: var(--verde-meraki);
		text-decoration: none;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s;
	}

	.back-link a:hover {
		transform: translateX(-4px);
	}

	.content-box {
		max-width: 800px;
		margin: 0 auto;
		background: var(--bianco);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: var(--verde-meraki);
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		text-align: center;
	}

	.intro {
		text-align: center;
		color: var(--grigio-scuro);
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.form-row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		color: var(--verde-meraki);
		font-weight: 600;
		font-size: 0.95rem;
	}

	input[type="text"],
	input[type="email"],
	input[type="tel"],
	input[type="file"],
	textarea {
		padding: 0.75rem;
		border: 2px solid var(--grigio-chiaro);
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.3s;
		font-family: inherit;
	}

	input[type="text"]:focus,
	input[type="email"]:focus,
	input[type="tel"]:focus,
	textarea:focus {
		outline: none;
		border-color: var(--verde-meraki);
		box-shadow: 0 0 0 3px rgba(21, 67, 21, 0.1);
	}

	input:disabled,
	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.file-selected {
		color: var(--verde-meraki);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.checkbox-group {
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
	}

	.checkbox-label input[type="checkbox"] {
		margin-top: 0.2rem;
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: var(--verde-meraki);
	}

	.checkbox-label span {
		flex: 1;
		color: var(--grigio-scuro);
		font-size: 0.95rem;
		font-weight: 400;
	}

	.checkbox-label a {
		color: var(--verde-meraki);
		text-decoration: underline;
	}

	.submit-btn {
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 700;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.2);
		margin-top: 1rem;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(21, 67, 21, 0.3);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.message {
		padding: 1rem;
		border-radius: 8px;
		font-weight: 500;
		text-align: center;
	}

	.error-message {
		background: #fee;
		color: #c33;
		border: 2px solid #fcc;
	}

	.success-message {
		background: #efe;
		color: #383;
		border: 2px solid #cfc;
	}

	@media (max-width: 767px) {
		.content-box {
			padding: 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}
	}
</style>

