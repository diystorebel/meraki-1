<script>
	import { onMount } from 'svelte';
	import { categoriesStore } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade, slide } from 'svelte/transition';
	import { X, Search, Home, ChevronDown, ChevronUp } from 'lucide-svelte';

	// Macro-categorie
	const MACRO_CATEGORIES = [
		{ name: 'Cocktail', icon: '🍸', keywords: ['cocktail', 'spirit', 'drink', 'aperitivo'] },
		{ name: 'Birre e Vini', icon: '🍷', keywords: ['birr', 'vino', 'vini', 'wine', 'beer', 'bollicine', 'prosecco'] },
		{ name: 'Cucina', icon: '🍽️', keywords: ['cucina', 'antipast', 'primo', 'second', 'dolc', 'pizza', 'panin', 'taglier', 'food'] }
	];

	let expandedMacro = null;
	let searchTerm = '';
	let searchExpanded = false;
	let selectedProduct = null;

	function getCategoriesForMacro(macroName) {
		const macro = MACRO_CATEGORIES.find(m => m.name === macroName);
		if (!macro) return [];
		return $categoriesStore.filter(cat => {
			const catNameLower = cat.name.toLowerCase();
			return macro.keywords.some(kw => catNameLower.includes(kw));
		});
	}

	function getItemsForCategory(categoryId) {
		return $menuStore.filter(item => item.is_available && item.category_id === categoryId);
	}

	function toggleMacro(macroName) {
		expandedMacro = expandedMacro === macroName ? null : macroName;
	}

	function toggleSearch() {
		searchExpanded = !searchExpanded;
		if (!searchExpanded) searchTerm = '';
	}

	// Filtered items per ricerca
	$: searchResults = searchTerm.trim() 
		? smartSearch($menuStore.filter(i => i.is_available), searchTerm)
		: [];

	function openProductDetail(product) {
		if (product.image_url) selectedProduct = product;
	}

	function closeDetail() {
		selectedProduct = null;
	}

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = selectedProduct ? 'hidden' : '';
	}
</script>

<svelte:head>
	<title>Menu V2 - Accordion | Meraki</title>
</svelte:head>

<div class="menu-page">
	<!-- Header -->
	<header class="menu-header">
		<div class="header-content">
			<a href="/" class="logo">MERAKI</a>
			<div class="header-actions">
				<span class="version-badge">V2 - Accordion</span>
				<a href="/menu-demo" class="back-button">
					<Home size={18} />
					Demo
				</a>
			</div>
		</div>
	</header>

	<!-- Banner -->
	<div class="aperitivo-banner">
		<strong>Aperitivo fino alle 21:00!</strong> Scegli il cocktail che preferisci e con l'aggiunta di € 3,00 
		(€ 5,00 senza glutine o lattosio) avrai una selezione di stuzzichini preparati al momento dal nostro chef!
	</div>

	<!-- Search Bar -->
	<div class="search-section">
		<div class="container">
			{#if searchExpanded || searchTerm}
				<div class="search-expanded">
					<Search size={18} />
					<input 
						type="text" 
						placeholder="Cerca nel menu..." 
						bind:value={searchTerm}
						autofocus
					/>
					<button on:click={() => { searchTerm = ''; searchExpanded = false; }}>
						<X size={18} />
					</button>
				</div>
			{:else}
				<button class="search-trigger" on:click={toggleSearch}>
					<Search size={20} />
					<span>Cerca nel menu...</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- Search Results -->
	{#if searchTerm.trim() && searchResults.length > 0}
		<div class="search-results" transition:slide>
			<div class="container">
				<h3>Risultati per "{searchTerm}"</h3>
				<div class="results-grid">
					{#each searchResults as item (item.id)}
						<div class="result-item" on:click={() => openProductDetail(item)}>
							{#if item.image_url}
								<img src={item.image_url} alt={item.name} />
							{/if}
							<div class="result-info">
								<span class="result-name">{item.name}</span>
								{#if item.pricing.type === 'single'}
									<span class="result-price">€ {item.pricing.value.toFixed(2)}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if searchTerm.trim() && searchResults.length === 0}
		<div class="search-results empty" transition:slide>
			<div class="container">
				<p>Nessun risultato per "{searchTerm}"</p>
			</div>
		</div>
	{/if}

	<!-- ACCORDION MENU -->
	{#if !searchTerm.trim()}
		<div class="accordion-menu">
			{#each MACRO_CATEGORIES as macro}
				{@const categories = getCategoriesForMacro(macro.name)}
				{@const isExpanded = expandedMacro === macro.name}
				
				<div class="accordion-section" class:expanded={isExpanded}>
					<!-- Accordion Header -->
					<button class="accordion-header" on:click={() => toggleMacro(macro.name)}>
						<div class="accordion-title">
							<span class="accordion-icon">{macro.icon}</span>
							<span class="accordion-name">{macro.name}</span>
						</div>
						<div class="accordion-chevron">
							{#if isExpanded}
								<ChevronUp size={24} />
							{:else}
								<ChevronDown size={24} />
							{/if}
						</div>
					</button>

					<!-- Accordion Content -->
					{#if isExpanded}
						<div class="accordion-content" transition:slide={{ duration: 300 }}>
							{#each categories as category}
								{@const items = getItemsForCategory(category.id)}
								{#if items.length > 0}
									<div class="category-section">
										<h4 class="category-title">{category.name}</h4>
										<div class="category-items">
											{#each items as item (item.id)}
												<div 
													class="menu-item" 
													class:has-image={item.image_url}
													on:click={() => openProductDetail(item)}
												>
													{#if item.image_url}
														<div class="item-thumb">
															<img src={item.image_url} alt={item.name} loading="lazy" />
														</div>
													{/if}
													<div class="item-info">
														<h5 class="item-name">{item.name}</h5>
														{#if item.description}
															<p class="item-description">{item.description}</p>
														{/if}
													</div>
													<div class="item-price">
														{#if item.pricing.type === 'multiple'}
															{#each item.pricing.variants as variant}
																<div class="price-variant">
																	<span class="variant-name">{variant.name}</span>
																	<span class="variant-price">€ {variant.price.toFixed(2)}</span>
																</div>
															{/each}
														{:else if item.pricing.type === 'single'}
															<span class="single-price">€ {item.pricing.value.toFixed(2)}</span>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Modal -->
	{#if selectedProduct}
		<div class="modal-overlay" on:click={closeDetail} transition:fade={{ duration: 250 }}>
			<div class="modal-detail" on:click|stopPropagation>
				<div class="modal-hero">
					{#if selectedProduct.image_url}
						<img src={selectedProduct.image_url} alt={selectedProduct.name} class="hero-img" />
					{/if}
					<div class="hero-gradient"></div>
					<button class="close-modal" on:click={closeDetail}>
						<X size={20} />
					</button>
				</div>
				<div class="modal-body">
					<h2>{selectedProduct.name}</h2>
					{#if selectedProduct.description}
						<p class="modal-desc">{selectedProduct.description}</p>
					{/if}
					{#if selectedProduct.detailed_description}
						<p class="modal-story">"{selectedProduct.detailed_description}"</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.menu-page {
		min-height: 100vh;
		background: var(--grigio-chiaro);
	}

	/* Header */
	.menu-header {
		background: var(--bianco);
		border-bottom: 2px solid var(--grigio);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.version-badge {
		background: #e67e22;
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.logo {
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--verde-meraki);
		text-decoration: none;
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.5rem 1rem;
		background: var(--grigio-chiaro);
		color: var(--verde-meraki);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 500;
		font-size: 0.85rem;
	}

	/* Banner */
	.aperitivo-banner {
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		padding: 1rem;
		text-align: center;
		font-size: 0.9rem;
	}

	/* Search */
	.search-section {
		padding: 1rem 0;
		background: var(--bianco);
		border-bottom: 1px solid var(--grigio);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.search-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.2rem;
		background: var(--grigio-chiaro);
		border: 1.5px solid var(--grigio);
		border-radius: 12px;
		color: var(--grigio-scuro);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.search-trigger:hover {
		border-color: var(--verde-meraki);
	}

	.search-expanded {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.2rem;
		background: var(--bianco);
		border: 2px solid var(--verde-meraki);
		border-radius: 12px;
	}

	.search-expanded input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1rem;
		outline: none;
	}

	.search-expanded button {
		background: var(--grigio-chiaro);
		border: none;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	/* Search Results */
	.search-results {
		background: var(--bianco);
		padding: 1.5rem 0;
		border-bottom: 2px solid var(--verde-meraki);
	}

	.search-results h3 {
		font-size: 1rem;
		color: var(--grigio-scuro);
		margin-bottom: 1rem;
	}

	.search-results.empty {
		text-align: center;
		color: var(--grigio-scuro);
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--grigio-chiaro);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.result-item:hover {
		background: var(--grigio);
	}

	.result-item img {
		width: 50px;
		height: 50px;
		object-fit: cover;
		border-radius: 8px;
	}

	.result-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.result-name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.result-price {
		color: var(--verde-meraki);
		font-weight: 600;
	}

	/* ACCORDION */
	.accordion-menu {
		padding: 1rem;
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.accordion-section {
		background: var(--bianco);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.accordion-section.expanded {
		box-shadow: 0 4px 20px rgba(21, 67, 21, 0.15);
	}

	.accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.accordion-section.expanded .accordion-header {
		background: var(--verde-meraki);
		color: white;
	}

	.accordion-title {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.accordion-icon {
		font-size: 2rem;
	}

	.accordion-name {
		font-family: 'Bebas Neue', 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.accordion-chevron {
		opacity: 0.7;
	}

	.accordion-content {
		padding: 0 1rem 1.5rem;
	}

	/* Category sections inside accordion */
	.category-section {
		padding-top: 1.5rem;
	}

	.category-section:not(:last-child) {
		border-bottom: 1px solid var(--grigio);
		padding-bottom: 1.5rem;
	}

	.category-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.1rem;
		color: var(--verde-meraki);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--verde-light);
		display: inline-block;
	}

	.category-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Menu Item - List style */
	.menu-item {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		padding: 1rem;
		background: var(--grigio-chiaro);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-item:hover {
		background: var(--grigio);
	}

	.menu-item.has-image {
		grid-template-columns: 60px 1fr auto;
	}

	.item-thumb {
		width: 60px;
		height: 60px;
		border-radius: 10px;
		overflow: hidden;
	}

	.item-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
	}

	.item-name {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.1rem;
		color: var(--verde-meraki);
		text-transform: uppercase;
		margin: 0;
	}

	.item-description {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		font-style: italic;
		margin: 0;
		line-height: 1.4;
	}

	.item-price {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 0.25rem;
	}

	.single-price {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	.price-variant {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.variant-name {
		font-size: 0.75rem;
		color: var(--grigio-scuro);
	}

	.variant-price {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--verde-meraki);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(10, 10, 10, 0.85);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 1.5rem;
	}

	.modal-detail {
		background: #fafaf8;
		border-radius: 24px;
		max-width: 420px;
		width: 100%;
		max-height: 85vh;
		overflow: hidden;
		position: relative;
	}

	.modal-hero {
		position: relative;
		height: 250px;
		overflow: hidden;
		background: var(--grigio);
	}

	.hero-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.hero-gradient {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(to bottom, transparent, #fafaf8);
	}

	.close-modal {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20;
	}

	.modal-body {
		padding: 24px;
		text-align: center;
	}

	.modal-body h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		color: var(--verde-meraki);
		margin-bottom: 1rem;
	}

	.modal-desc {
		color: var(--grigio-scuro);
		font-style: italic;
		margin-bottom: 1rem;
	}

	.modal-story {
		padding-top: 1rem;
		border-top: 1px solid var(--grigio);
		color: #666;
		font-style: italic;
	}
</style>
