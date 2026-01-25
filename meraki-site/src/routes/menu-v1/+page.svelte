<script>
	import { onMount } from 'svelte';
	import { categoriesStore } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade } from 'svelte/transition';
	import { X, Search, Home } from 'lucide-svelte';

	// Macro-categorie configurabili (mappano le categorie esistenti)
	const MACRO_CATEGORIES = [
		{ 
			name: 'Cocktail', 
			image: '/foto/cocktail.jpeg',
			keywords: ['cocktail', 'spirit', 'drink', 'aperitivo']
		},
		{ 
			name: 'Birre e Vini', 
			image: '/foto/birre e vini.jpg',
			keywords: ['birr', 'vino', 'vini', 'wine', 'beer', 'bollicine', 'prosecco']
		},
		{ 
			name: 'Cucina', 
			image: '/foto/cucina.jpeg',
			keywords: ['cucina', 'antipast', 'primo', 'second', 'dolc', 'pizza', 'panin', 'taglier', 'food']
		}
	];

	let selectedMacro = null;
	let selectedSubcategory = null;
	let searchTerm = '';
	let searchExpanded = false;
	let selectedProduct = null;

	// Mappa categorie esistenti alle macro-categorie
	function getCategoriesForMacro(macroName) {
		const macro = MACRO_CATEGORIES.find(m => m.name === macroName);
		if (!macro) return [];
		
		return $categoriesStore.filter(cat => {
			const catNameLower = cat.name.toLowerCase();
			return macro.keywords.some(kw => catNameLower.includes(kw));
		});
	}

	// Ottieni sottocategorie per la macro selezionata
	$: subcategories = (() => {
		if (!selectedMacro) return [];
		const cats = getCategoriesForMacro(selectedMacro);
		// Le sottocategorie sono i nomi delle categorie mappate
		return cats.map(c => c.name);
	})();

	// Helper per ottenere category_id dalla sottocategoria
	function getCategoryId(subcategoryName) {
		const cat = $categoriesStore.find(c => c.name === subcategoryName);
		return cat ? cat.id : null;
	}

	// Filtra items
	$: filteredItems = (() => {
		const availableItems = $menuStore.filter(item => item.is_available);
		
		if (searchTerm && searchTerm.trim() !== '') {
			return smartSearch(availableItems, searchTerm);
		}
		
		if (!selectedMacro) return availableItems;
		
		const macroCats = getCategoriesForMacro(selectedMacro);
		const macroCatIds = macroCats.map(c => c.id);
		
		return availableItems.filter(item => {
			const matchesMacro = macroCatIds.includes(item.category_id);
			const matchesSubcat = !selectedSubcategory || 
				getCategoryId(selectedSubcategory) === item.category_id;
			return matchesMacro && matchesSubcat;
		});
	})();

	function selectMacro(macro) {
		if (selectedMacro === macro) {
			selectedMacro = null;
			selectedSubcategory = null;
		} else {
			selectedMacro = macro;
			selectedSubcategory = null;
		}
	}

	function selectSubcategory(subcat) {
		selectedSubcategory = selectedSubcategory === subcat ? null : subcat;
	}

	function clearFilters() {
		selectedMacro = null;
		selectedSubcategory = null;
		searchTerm = '';
		searchExpanded = false;
	}

	function toggleSearch() {
		searchExpanded = !searchExpanded;
		if (!searchExpanded) searchTerm = '';
	}

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
	<title>Menu V1 - Tab + Chips | Meraki</title>
</svelte:head>

<div class="menu-page">
	<!-- Header -->
	<header class="menu-header">
		<div class="header-content">
			<a href="/" class="logo">MERAKI</a>
			<div class="header-actions">
				<span class="version-badge">V1 - Tab + Chips</span>
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

	<!-- MACRO TABS - Card con immagini -->
	<div class="macro-tabs">
		{#each MACRO_CATEGORIES as macro}
			<button 
				class="macro-tab"
				class:active={selectedMacro === macro.name}
				on:click={() => selectMacro(macro.name)}
			>
				<img src={macro.image} alt={macro.name} class="macro-bg" loading="lazy" />
				<div class="macro-overlay"></div>
				<span class="macro-name">{macro.name}</span>
			</button>
		{/each}
	</div>

	<!-- Filters: Search + Subcategories -->
	<div class="filters-section">
		<div class="container">
			{#if searchExpanded || searchTerm}
				<div class="search-expanded">
					<Search size={18} class="search-icon-static" />
					<input 
						type="text" 
						placeholder="Cerca nel menu..." 
						bind:value={searchTerm}
						class="search-input-full"
						autofocus
					/>
					<button class="search-close-btn" on:click={() => { searchTerm = ''; searchExpanded = false; }}>
						<X size={18} />
					</button>
				</div>
			{:else}
				<div class="subcategories-row">
					<button class="search-btn" on:click={toggleSearch}>
						<Search size={18} />
					</button>
					
					{#if selectedMacro && subcategories.length > 0}
						{#each subcategories as subcat}
							<button 
								class="subcat-btn"
								class:active={selectedSubcategory === subcat}
								on:click={() => selectSubcategory(subcat)}
							>
								{subcat}
							</button>
						{/each}
					{:else}
						<span class="hint-text">Seleziona una categoria sopra</span>
					{/if}
					
					{#if selectedMacro || selectedSubcategory}
						<button class="reset-btn" on:click={clearFilters}>
							<X size={14} />
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Menu Items -->
	<div class="menu-items">
		<div class="container">
			{#if filteredItems.length > 0}
				<div class="items-grid">
					{#each filteredItems as item (item.id)}
						{#if item.image_url}
							<div class="menu-item menu-item-premium" on:click={() => openProductDetail(item)} transition:fade={{ duration: 200 }}>
								<div class="premium-bg">
									<img src={item.image_url} alt={item.name} loading="lazy" />
									<div class="premium-overlay"></div>
								</div>
								<div class="premium-content">
									<h3 class="item-name">{item.name}</h3>
									{#if item.description}
										<p class="item-description">{item.description}</p>
									{/if}
									<div class="premium-footer">
										<span class="click-badge">+ Info</span>
										{#if item.pricing.type === 'multiple'}
											<div class="sizes">
												{#each item.pricing.variants as variant}
													<div class="size-badge">
														<span class="size-name">{variant.name}</span>
														<span class="size-price">€ {variant.price.toFixed(2)}</span>
													</div>
												{/each}
											</div>
										{:else if item.pricing.type === 'single'}
											<div class="item-price">€ {item.pricing.value.toFixed(2)}</div>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div class="menu-item" transition:fade={{ duration: 200 }}>
								<div class="item-header">
									<h3 class="item-name">{item.name}</h3>
									{#if item.description}
										<p class="item-description">{item.description}</p>
									{/if}
								</div>
								<div class="item-footer">
									{#if item.pricing.type === 'multiple'}
										<div class="sizes">
											{#each item.pricing.variants as variant}
												<div class="size-badge">
													<span class="size-name">{variant.name}</span>
													<span class="size-price">€ {variant.price.toFixed(2)}</span>
												</div>
											{/each}
										</div>
									{:else if item.pricing.type === 'single'}
										<div class="item-price">€ {item.pricing.value.toFixed(2)}</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<h3>Nessun prodotto trovato</h3>
					<p>Prova a modificare i filtri o la ricerca</p>
					<button class="reset-button" on:click={clearFilters}>Reset Filtri</button>
				</div>
			{/if}
		</div>
	</div>

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
					<div class="recipe-header">
						<div class="recipe-line"></div>
						<h2>{selectedProduct.name}</h2>
						<div class="recipe-line"></div>
					</div>
					{#if selectedProduct.description}
						<div class="recipe-ingredients">
							<span class="ingredients-label">Ingredienti</span>
							<p>{selectedProduct.description}</p>
						</div>
					{/if}
					{#if selectedProduct.detailed_description}
						<div class="recipe-story">
							<p>"{selectedProduct.detailed_description}"</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.menu-page {
		min-height: 100vh;
		background: var(--bianco);
		width: 100%;
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
		background: var(--verde-meraki);
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
		line-height: 1.5;
	}

	/* MACRO TABS - Card con immagini */
	.macro-tabs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--verde-meraki);
	}

	.macro-tab {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100px;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.macro-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.macro-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(21, 67, 21, 0.75) 0%,
			rgba(21, 67, 21, 0.55) 100%
		);
		transition: all 0.3s ease;
	}

	.macro-tab:hover .macro-bg {
		transform: scale(1.08);
	}

	.macro-tab:hover .macro-overlay {
		background: linear-gradient(
			135deg,
			rgba(21, 67, 21, 0.65) 0%,
			rgba(21, 67, 21, 0.45) 100%
		);
	}

	.macro-tab.active {
		box-shadow: 0 0 0 3px var(--bianco), 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.macro-tab.active .macro-overlay {
		background: linear-gradient(
			135deg,
			rgba(21, 67, 21, 0.45) 0%,
			rgba(21, 67, 21, 0.25) 100%
		);
	}

	.macro-name {
		position: relative;
		z-index: 2;
		font-family: 'Bebas Neue', 'Playfair Display', serif;
		font-size: 1.1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bianco);
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
		padding: 0.5rem 1rem;
	}

	@media (min-width: 768px) {
		.macro-tabs {
			gap: 0.75rem;
			padding: 0.75rem;
		}

		.macro-tab {
			min-height: 140px;
			border-radius: 16px;
		}

		.macro-name {
			font-size: 1.5rem;
			letter-spacing: 0.1em;
		}
	}

	/* Filters */
	.filters-section {
		background: var(--grigio-chiaro);
		padding: 1rem 0;
		border-bottom: 1px solid var(--grigio);
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 0.75rem;
	}

	.search-expanded {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bianco);
		border: 1.5px solid var(--verde-meraki);
		border-radius: 20px;
		padding: 0 0.8rem;
		height: 42px;
	}

	.search-expanded :global(.search-icon-static) {
		color: var(--verde-meraki);
		flex-shrink: 0;
	}

	.search-input-full {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1rem;
		outline: none;
	}

	.search-close-btn {
		width: 26px;
		height: 26px;
		border: none;
		background: var(--grigio-chiaro);
		color: var(--grigio-scuro);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.subcategories-row {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		align-items: center;
		padding-bottom: 0.25rem;
	}

	.subcategories-row::-webkit-scrollbar {
		display: none;
	}

	.search-btn {
		width: 42px;
		height: 42px;
		border: 1.5px solid var(--verde-meraki);
		background: var(--bianco);
		color: var(--verde-meraki);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.subcat-btn {
		padding: 0.5rem 1rem;
		border: 1.5px solid var(--verde-light);
		background: var(--bianco);
		color: var(--verde-meraki);
		border-radius: 20px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.subcat-btn:hover, .subcat-btn.active {
		background: var(--verde-light);
		color: white;
	}

	.hint-text {
		color: var(--grigio-scuro);
		font-size: 0.9rem;
		font-style: italic;
	}

	.reset-btn {
		width: 32px;
		height: 32px;
		border: 1.5px solid var(--grigio);
		background: var(--bianco);
		color: var(--grigio-scuro);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Menu Items */
	.menu-items {
		padding: 2rem 0 3rem;
	}

	.items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.items-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}
	}

	/* Card Standard */
	.menu-item {
		background: var(--bianco);
		border: 2px solid rgba(26, 90, 26, 0.35);
		border-radius: 16px;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		overflow: hidden;
	}

	/* Card Premium */
	.menu-item-premium {
		min-height: 180px;
		cursor: pointer;
		padding: 0;
	}

	.premium-bg {
		position: absolute;
		inset: 0;
		border-radius: 16px;
		overflow: hidden;
	}

	.premium-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.premium-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, rgba(21, 67, 21, 0.95) 0%, rgba(21, 67, 21, 0.7) 50%, rgba(21, 67, 21, 0.3) 100%);
	}

	.premium-content {
		position: relative;
		z-index: 2;
		padding: 1.5rem;
		height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 180px;
	}

	.premium-content .item-name,
	.premium-content .item-description {
		color: var(--bianco);
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}

	.premium-content .item-description {
		flex: 1;
	}

	.premium-footer {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.premium-footer .item-price {
		color: white;
	}

	.premium-footer .size-name {
		color: rgba(255, 255, 255, 0.75);
	}

	.premium-footer .size-price {
		color: white;
	}

	.click-badge {
		padding: 0.4rem 1rem;
		border: 2px solid white;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 700;
		color: white;
	}

	.item-header {
		flex: 1;
	}

	.item-name {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.5rem;
		color: var(--verde-meraki);
		margin-bottom: 0.4rem;
		text-transform: uppercase;
	}

	.item-description {
		font-size: 1rem;
		color: var(--grigio-scuro);
		font-style: italic;
	}

	.item-footer {
		border-top: 1px solid var(--grigio);
		padding-top: 1rem;
	}

	.item-price {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--verde-meraki);
		text-align: right;
	}

	.sizes {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.size-badge {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.size-name {
		font-size: 0.8rem;
		color: var(--grigio-scuro);
	}

	.size-price {
		font-size: 1rem;
		font-weight: 600;
		color: var(--verde-meraki);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--grigio-scuro);
	}

	.empty-state h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.reset-button {
		margin-top: 1.5rem;
		padding: 1rem 2rem;
		background: var(--verde-meraki);
		color: white;
		border: none;
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
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
		height: 280px;
		overflow: hidden;
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
		padding: 24px 28px 32px;
	}

	.recipe-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 28px;
	}

	.recipe-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, var(--verde-meraki), transparent);
		opacity: 0.4;
	}

	.modal-body h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.75rem;
		color: var(--verde-meraki);
		text-align: center;
	}

	.recipe-ingredients {
		text-align: center;
		margin-bottom: 24px;
	}

	.ingredients-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--verde-light);
	}

	.recipe-ingredients p {
		font-size: 1rem;
		color: var(--grigio-scuro);
		font-style: italic;
		margin-top: 10px;
	}

	.recipe-story {
		padding-top: 20px;
		border-top: 1px solid var(--grigio);
	}

	.recipe-story p {
		font-family: 'Playfair Display', serif;
		font-size: 0.95rem;
		color: #666;
		text-align: center;
		font-style: italic;
	}
</style>
