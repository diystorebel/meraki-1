<script>
	import { onMount } from 'svelte';
	import { categoriesStore } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade, fly, slide } from 'svelte/transition';
	import { X, Search, Home, ChevronDown, Filter } from 'lucide-svelte';

	// Macro-categorie
	const MACRO_CATEGORIES = [
		{ name: 'Cocktail', icon: '🍸', keywords: ['cocktail', 'spirit', 'drink', 'aperitivo'] },
		{ name: 'Birre e Vini', icon: '🍷', keywords: ['birr', 'vino', 'vini', 'wine', 'beer', 'bollicine', 'prosecco'] },
		{ name: 'Cucina', icon: '🍽️', keywords: ['cucina', 'antipast', 'primo', 'second', 'dolc', 'pizza', 'panin', 'taglier', 'food'] }
	];

	let selectedMacro = MACRO_CATEGORIES[0].name;
	let selectedSubcategory = null;
	let dropdownOpen = false;
	let searchTerm = '';
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

	$: currentCategories = getCategoriesForMacro(selectedMacro);

	$: filteredItems = (() => {
		const availableItems = $menuStore.filter(item => item.is_available);
		
		if (searchTerm.trim()) {
			return smartSearch(availableItems, searchTerm);
		}

		const macroCats = getCategoriesForMacro(selectedMacro);
		const macroCatIds = macroCats.map(c => c.id);

		if (selectedSubcategory) {
			const subCat = currentCategories.find(c => c.name === selectedSubcategory);
			if (subCat) {
				return availableItems.filter(item => item.category_id === subCat.id);
			}
		}

		return availableItems.filter(item => macroCatIds.includes(item.category_id));
	})();

	function selectMacro(macro) {
		selectedMacro = macro;
		selectedSubcategory = null;
		dropdownOpen = false;
	}

	function selectSubcategory(subcat) {
		selectedSubcategory = subcat;
		dropdownOpen = false;
	}

	function clearSubcategory() {
		selectedSubcategory = null;
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function openProductDetail(product) {
		if (product.image_url) selectedProduct = product;
	}

	function closeDetail() {
		selectedProduct = null;
	}

	// Close dropdown on outside click
	function handleOutsideClick(e) {
		if (dropdownOpen && !e.target.closest('.dropdown-container')) {
			dropdownOpen = false;
		}
	}

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = selectedProduct ? 'hidden' : '';
	}
</script>

<svelte:window on:click={handleOutsideClick} />

<svelte:head>
	<title>Menu V4 - Tab + Dropdown | Meraki</title>
</svelte:head>

<div class="menu-page">
	<!-- Header -->
	<header class="menu-header">
		<div class="header-content">
			<a href="/" class="logo">MERAKI</a>
			<div class="header-actions">
				<span class="version-badge">V4 - Dropdown</span>
				<a href="/menu-demo" class="back-button">
					<Home size={18} />
					Demo
				</a>
			</div>
		</div>
	</header>

	<!-- Banner compatto -->
	<div class="aperitivo-banner">
		<strong>🍸 Aperitivo fino alle 21:00!</strong> +€3 per stuzzichini
	</div>

	<!-- MACRO TABS -->
	<div class="macro-tabs">
		{#each MACRO_CATEGORIES as macro}
			<button 
				class="macro-tab"
				class:active={selectedMacro === macro.name}
				on:click={() => selectMacro(macro.name)}
			>
				<span class="tab-icon">{macro.icon}</span>
				<span class="tab-name">{macro.name}</span>
			</button>
		{/each}
	</div>

	<!-- Filter Bar: Search + Dropdown -->
	<div class="filter-bar">
		<div class="container">
			<!-- Search Input -->
			<div class="search-box">
				<Search size={18} />
				<input 
					type="text" 
					placeholder="Cerca..." 
					bind:value={searchTerm}
				/>
				{#if searchTerm}
					<button class="clear-btn" on:click={() => searchTerm = ''}>
						<X size={16} />
					</button>
				{/if}
			</div>

			<!-- Dropdown per sottocategorie -->
			<div class="dropdown-container">
				<button class="dropdown-trigger" on:click|stopPropagation={toggleDropdown}>
					<Filter size={18} />
					<span>{selectedSubcategory || 'Tutte'}</span>
					<ChevronDown size={18} class:rotated={dropdownOpen} />
				</button>

				{#if dropdownOpen}
					<div class="dropdown-menu" transition:fly={{ y: -10, duration: 200 }}>
						<button 
							class="dropdown-item"
							class:active={!selectedSubcategory}
							on:click={() => { selectedSubcategory = null; dropdownOpen = false; }}
						>
							Mostra tutto
						</button>
						<div class="dropdown-divider"></div>
						{#each currentCategories as cat}
							{@const count = getItemsForCategory(cat.id).length}
							<button 
								class="dropdown-item"
								class:active={selectedSubcategory === cat.name}
								on:click={() => selectSubcategory(cat.name)}
							>
								<span>{cat.name}</span>
								<span class="item-count">{count}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Active Filter Chip -->
	{#if selectedSubcategory}
		<div class="active-filter" transition:slide>
			<span>Filtro: <strong>{selectedSubcategory}</strong></span>
			<button on:click={clearSubcategory}>
				<X size={16} />
			</button>
		</div>
	{/if}

	<!-- Results Count -->
	<div class="results-info">
		<span>{filteredItems.length} prodotti</span>
	</div>

	<!-- Menu Items -->
	<div class="menu-items">
		<div class="container">
			{#if filteredItems.length > 0}
				<div class="items-grid">
					{#each filteredItems as item (item.id)}
						<div 
							class="menu-card"
							class:has-image={item.image_url}
							on:click={() => openProductDetail(item)}
							transition:fade={{ duration: 150 }}
						>
							{#if item.image_url}
								<div class="card-image">
									<img src={item.image_url} alt={item.name} loading="lazy" />
									<div class="card-overlay"></div>
								</div>
							{/if}
							<div class="card-body" class:with-image={item.image_url}>
								<h3>{item.name}</h3>
								{#if item.description}
									<p>{item.description}</p>
								{/if}
								<div class="card-footer">
									{#if item.image_url}
										<span class="info-badge">+ Info</span>
									{/if}
									<div class="price-area">
										{#if item.pricing.type === 'multiple'}
											{#each item.pricing.variants as variant}
												<div class="price-variant">
													<span class="v-name">{variant.name}</span>
													<span class="v-price">€{variant.price.toFixed(2)}</span>
												</div>
											{/each}
										{:else if item.pricing.type === 'single'}
											<span class="single-price">€ {item.pricing.value.toFixed(2)}</span>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<h3>Nessun prodotto trovato</h3>
					<p>Prova a modificare i filtri</p>
					<button on:click={() => { searchTerm = ''; selectedSubcategory = null; }}>
						Reset
					</button>
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
						<img src={selectedProduct.image_url} alt={selectedProduct.name} />
					{/if}
					<button class="close-modal" on:click={closeDetail}>
						<X size={24} />
					</button>
				</div>
				<div class="modal-body">
					<h2>{selectedProduct.name}</h2>
					{#if selectedProduct.description}
						<p class="desc">{selectedProduct.description}</p>
					{/if}
					{#if selectedProduct.detailed_description}
						<p class="story">"{selectedProduct.detailed_description}"</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.menu-page {
		min-height: 100vh;
		background: #f5f5f5;
	}

	/* Header */
	.menu-header {
		background: var(--bianco);
		border-bottom: 1px solid var(--grigio);
		position: sticky;
		top: 0;
		z-index: 200;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.6rem 1rem;
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
		background: #3498db;
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.logo {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
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
		background: var(--verde-meraki);
		color: white;
		padding: 0.6rem 1rem;
		text-align: center;
		font-size: 0.85rem;
	}

	/* MACRO TABS */
	.macro-tabs {
		display: flex;
		background: var(--bianco);
		border-bottom: 2px solid var(--grigio);
		position: sticky;
		top: 48px;
		z-index: 150;
	}

	.macro-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 1rem 0.5rem;
		background: transparent;
		border: none;
		color: var(--grigio-scuro);
		cursor: pointer;
		transition: all 0.2s;
		border-bottom: 3px solid transparent;
		margin-bottom: -2px;
	}

	.macro-tab:hover {
		color: var(--verde-meraki);
	}

	.macro-tab.active {
		color: var(--verde-meraki);
		border-bottom-color: var(--verde-meraki);
	}

	.tab-icon {
		font-size: 1.4rem;
	}

	.tab-name {
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
	}

	@media (min-width: 768px) {
		.tab-name {
			font-size: 1rem;
		}
	}

	/* Filter Bar */
	.filter-bar {
		background: var(--bianco);
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--grigio);
		position: sticky;
		top: 110px;
		z-index: 140;
	}

	.filter-bar .container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		gap: 0.75rem;
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1rem;
		background: var(--grigio-chiaro);
		border: 1.5px solid var(--grigio);
		border-radius: 10px;
		height: 44px;
	}

	.search-box:focus-within {
		border-color: var(--verde-meraki);
	}

	.search-box input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 0.95rem;
		outline: none;
	}

	.clear-btn {
		background: var(--grigio);
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	/* Dropdown */
	.dropdown-container {
		position: relative;
	}

	.dropdown-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1rem;
		height: 44px;
		background: var(--verde-meraki);
		color: white;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.dropdown-trigger:hover {
		background: var(--verde-light);
	}

	.dropdown-trigger :global(.rotated) {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		min-width: 200px;
		background: var(--bianco);
		border: 1px solid var(--grigio);
		border-radius: 12px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		z-index: 1000;
	}

	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		background: transparent;
		border: none;
		text-align: left;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.dropdown-item:hover {
		background: var(--grigio-chiaro);
	}

	.dropdown-item.active {
		background: var(--verde-meraki);
		color: white;
	}

	.dropdown-item .item-count {
		font-size: 0.8rem;
		opacity: 0.7;
	}

	.dropdown-divider {
		height: 1px;
		background: var(--grigio);
	}

	/* Active Filter */
	.active-filter {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.6rem 1rem;
		background: rgba(21, 67, 21, 0.1);
		font-size: 0.9rem;
	}

	.active-filter button {
		background: var(--verde-meraki);
		color: white;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	/* Results Info */
	.results-info {
		padding: 0.75rem 1rem;
		text-align: center;
		font-size: 0.85rem;
		color: var(--grigio-scuro);
	}

	/* Menu Items */
	.menu-items {
		padding: 0 0 3rem;
	}

	.menu-items .container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.items-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 500px) {
		.items-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 900px) {
		.items-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.items-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Menu Card */
	.menu-card {
		background: var(--bianco);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		transition: all 0.3s;
	}

	.menu-card:hover {
		box-shadow: 0 8px 25px rgba(21, 67, 21, 0.12);
		transform: translateY(-4px);
	}

	.card-image {
		position: relative;
		height: 150px;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s;
	}

	.menu-card:hover .card-image img {
		transform: scale(1.1);
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%);
	}

	.card-body {
		padding: 1rem;
	}

	.card-body.with-image {
		padding-top: 0.75rem;
	}

	.card-body h3 {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.15rem;
		color: var(--verde-meraki);
		text-transform: uppercase;
		margin: 0 0 0.4rem 0;
	}

	.card-body p {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		font-style: italic;
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--grigio);
	}

	.info-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--verde-meraki);
		border: 1.5px solid var(--verde-meraki);
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
	}

	.price-area {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
	}

	.single-price {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	.price-variant {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
	}

	.v-name {
		font-size: 0.75rem;
		color: var(--grigio-scuro);
	}

	.v-price {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--verde-meraki);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-state h3 {
		color: var(--nero);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: var(--grigio-scuro);
		margin-bottom: 1.5rem;
	}

	.empty-state button {
		padding: 0.8rem 2rem;
		background: var(--verde-meraki);
		color: white;
		border: none;
		border-radius: 8px;
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
		border-radius: 20px;
		max-width: 400px;
		width: 100%;
		max-height: 85vh;
		overflow: hidden;
	}

	.modal-hero {
		position: relative;
		height: 260px;
		background: var(--grigio);
	}

	.modal-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.close-modal {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 40px;
		height: 40px;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-body {
		padding: 20px;
		text-align: center;
	}

	.modal-body h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.4rem;
		color: var(--verde-meraki);
		margin-bottom: 0.75rem;
	}

	.modal-body .desc {
		color: var(--grigio-scuro);
		font-style: italic;
		font-size: 0.95rem;
	}

	.modal-body .story {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--grigio);
		color: #666;
		font-style: italic;
		font-size: 0.9rem;
	}
</style>
