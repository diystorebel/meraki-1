<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { initAuth } from '$lib/stores/authStore';
	import { loadCategories } from '$lib/stores/categoriesStore';
	import { loadMenu } from '$lib/stores/menuStore';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import '../app.css';

	let contentReady = false;

	// SEO Configuration
	const siteUrl = 'https://www.merakilainate.it';
	const siteName = 'Meraki Lainate';
	const siteDescription = 'Cocktail bar a Lainate. Scopri i nostri cocktails artigianali, drinks e food in un\'atmosfera unica. L\'essenza di noi stessi.';
	const siteImage = `${siteUrl}/og-image.jpg`;

	// JSON-LD Structured Data for LocalBusiness
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BarOrPub",
		"name": "Meraki",
		"alternateName": "Meraki Lainate",
		"description": siteDescription,
		"url": siteUrl,
		"logo": `${siteUrl}/Logo-1.png`,
		"image": siteImage,
		"telephone": "+393516327144",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Via Re Umberto I°, 36A",
			"addressLocality": "Lainate",
			"addressRegion": "MI",
			"postalCode": "20045",
			"addressCountry": "IT"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": 45.57483921503279,
			"longitude": 9.02737271778262
		},
		"openingHoursSpecification": [
			{
				"@type": "OpeningHoursSpecification",
				"dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
				"opens": "18:00",
				"closes": "01:00"
			},
			{
				"@type": "OpeningHoursSpecification",
				"dayOfWeek": ["Friday", "Saturday"],
				"opens": "18:00",
				"closes": "02:00"
			}
		],
		"sameAs": [
			"https://www.facebook.com/meraki.lainate",
			"https://www.instagram.com/meraki.lainate/"
		],
		"servesCuisine": ["Cocktails", "Drinks", "Finger Food"],
		"priceRange": "€€"
	};

	// Initialize auth and load data on app start (only in browser)
	onMount(async () => {
		if (browser) {
			try {
				// Parallel loading: auth prima, poi dati in parallelo
				await initAuth();
				await Promise.all([loadCategories(), loadMenu()]);
			} catch (error) {
				console.error('Error initializing app:', error);
			}
		}
		// Mostra il footer solo dopo che il layout è montato
		contentReady = true;
	});
</script>

<svelte:head>
	<!-- SEO Meta Tags -->
	<meta name="description" content={siteDescription} />
	<meta name="keywords" content="cocktail bar, bar lainate, aperitivo lainate, drinks, cocktails artigianali, nightlife milano, meraki" />
	<meta name="author" content="Meraki Lainate" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={siteUrl} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={siteName} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="it_IT" />
	<meta property="og:site_name" content={siteName} />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={siteName} />
	<meta name="twitter:description" content={siteDescription} />
	<meta name="twitter:image" content={siteImage} />
	
	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="layout-wrapper">
	<main class="layout-main">
		<slot />
	</main>

	{#if contentReady}
		<footer class="powered-footer">
			<p>
				powered by <strong>One2One</strong> di Giovanni Marascio — 
				<a href="https://www.one2one.it" target="_blank" rel="noopener">www.one2one.it</a>
				<span class="tagline">Digital Food & Beverage</span>
			</p>
		</footer>
	{/if}
</div>

<!-- Cookie Banner (globale) -->
<CookieBanner />

<style>
	.layout-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.layout-main {
		flex: 1;
	}

	.powered-footer {
		background: #1a1a1a;
		padding: 1rem;
		text-align: center;
		border-top: 1px solid #333;
	}

	.powered-footer p {
		margin: 0;
		font-size: 0.75rem;
		color: #b3b3b3; /* Aumentato da #888 per contrasto WCAG AA (4.5:1) */
		letter-spacing: 0.02em;
	}

	.powered-footer strong {
		color: #d4d4d4; /* Aumentato da #aaa per migliore contrasto */
	}

	.powered-footer a {
		color: #6ec56e; /* Verde più chiaro per contrasto su sfondo scuro (WCAG AA 4.5:1) */
		text-decoration: underline;
		transition: color 0.2s;
	}

	.powered-footer a:hover {
		color: #6bb86b; /* Verde ancora più chiaro al hover */
		text-decoration: underline;
	}

	.powered-footer .tagline {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.65rem;
		color: #999; /* Aumentato da #666 per contrasto WCAG AA */
		font-style: italic;
	}

	@media (min-width: 640px) {
		.powered-footer .tagline {
			display: inline;
			margin-top: 0;
			margin-left: 0.5rem;
		}
	}
</style>
