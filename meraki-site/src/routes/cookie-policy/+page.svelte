<svelte:head>
	<title>Cookie Policy - Meraki</title>
</svelte:head>

<div class="policy-page">
	<header class="header">
		<div class="container">
			<a href="/" class="back-button">← Torna alla Home</a>
		</div>
	</header>

	<div class="container">
		<h1>Cookie Policy</h1>
		<p class="intro">Informativa sull'utilizzo dei cookie sul sito Meraki</p>

		<section>
			<h2>Cosa Sono i Cookie</h2>
			<p>
				I cookie sono piccoli file di testo memorizzati sul dispositivo dell'utente che permettono il corretto funzionamento del sito e l'analisi dell'utilizzo dello stesso.
			</p>
		</section>

		<section>
			<h2>Cookie Utilizzati</h2>
			<p>
				Questo sito utilizza <strong>esclusivamente cookie tecnici essenziali</strong> necessari per il funzionamento del servizio:
			</p>
			<ul>
				<li><strong>Session cookie:</strong> mantengono la sessione di navigazione</li>
				<li><strong>Preferenze di navigazione:</strong> memorizzano scelte tecniche dell'utente</li>
				<li><strong>Cookie di sicurezza:</strong> proteggono l'integrità del sito</li>
			</ul>
			<p>
				Questi cookie sono <strong>esenti da richiesta di consenso preventivo</strong> secondo le Linee Guida del Garante per la Protezione dei Dati Personali, in quanto strettamente necessari per erogare il servizio richiesto.
			</p>
		</section>

		<section>
			<h2>Cookie di Tracciamento</h2>
			<p>
				Questo sito <strong>non utilizza</strong> cookie di profilazione, analytics di terze parti, o cookie pubblicitari.
			</p>
		</section>

		<section>
			<h2>Durata dei Cookie</h2>
			<p>
				I cookie tecnici rimangono sul dispositivo per la durata della sessione di navigazione o per il periodo strettamente necessario al loro funzionamento.
			</p>
		</section>

		<section>
			<h2>Come Gestire i Cookie</h2>
			<p>
				Puoi controllare e cancellare i cookie attraverso le impostazioni del tuo browser:
			</p>
			<ul>
				<li><strong>Chrome:</strong> Impostazioni › Privacy e sicurezza › Cookie e altri dati dei siti</li>
				<li><strong>Firefox:</strong> Preferenze › Privacy e sicurezza › Cookie e dati dei siti</li>
				<li><strong>Safari:</strong> Preferenze › Privacy › Gestisci dati dei siti web</li>
				<li><strong>Edge:</strong> Impostazioni › Privacy › Cancella dati di navigazione</li>
			</ul>
			<p>
				<strong>Nota:</strong> La disabilitazione dei cookie tecnici potrebbe compromettere il corretto funzionamento del sito.
			</p>
		</section>

		<section>
			<h2>Modifiche alla Cookie Policy</h2>
			<p>
				Ci riserviamo il diritto di aggiornare questa policy. Le modifiche entreranno in vigore dalla data di pubblicazione sul sito.
			</p>
			<p><strong>Data di ultimo aggiornamento:</strong> 22 novembre 2025</p>
		</section>
	</div>
</div>

<style>
	.policy-page {
		min-height: 100vh;
		background: var(--bianco);
		padding-bottom: 3rem;
		width: 100%;
		overflow-x: hidden;
	}

	@media (min-width: 768px) {
		.policy-page {
			padding-bottom: 4rem;
		}
	}

	.header {
		background: var(--verde-meraki);
		padding: 1rem 0;
		margin-bottom: 2rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.header {
			padding: 1.5rem 0;
			margin-bottom: 3rem;
		}
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.container {
			padding: 0 2rem;
		}
	}

	.back-button {
		color: var(--bianco);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.3s ease;
	}

	.back-button:hover {
		opacity: 0.8;
	}

	h1 {
		font-size: 1.8rem;
		color: var(--verde-meraki);
		margin-bottom: 0.8rem;
	}

	@media (min-width: 768px) {
		h1 {
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
	}

	.intro {
		font-size: 0.95rem;
		color: var(--grigio-scuro);
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	@media (min-width: 768px) {
		.intro {
			font-size: 1.1rem;
			margin-bottom: 3rem;
		}
	}

	section {
		margin-bottom: 2rem;
	}

	@media (min-width: 768px) {
		section {
			margin-bottom: 2.5rem;
		}
	}

	h2 {
		font-size: 1.3rem;
		color: var(--verde-meraki);
		margin-bottom: 0.8rem;
	}

	@media (min-width: 768px) {
		h2 {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}
	}

	p {
		line-height: 1.7;
		color: var(--nero);
		font-size: 0.95rem;
		margin-bottom: 1rem;
	}

	@media (min-width: 768px) {
		p {
			line-height: 1.8;
			font-size: 1rem;
		}
	}

	ul {
		margin: 1rem 0 1rem 1.5rem;
		line-height: 1.8;
	}

	ul li {
		margin-bottom: 0.5rem;
		color: var(--nero);
		font-size: 0.95rem;
	}

	@media (min-width: 768px) {
		ul li {
			font-size: 1rem;
		}
	}

	strong {
		color: var(--verde-meraki);
		font-weight: 600;
	}
</style>

