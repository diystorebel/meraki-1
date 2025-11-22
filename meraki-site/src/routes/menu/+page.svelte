<script>
	import { onMount } from 'svelte';
	import { categoriesStore, getSubcategoriesForCategory } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { loadEventiAttivi } from '$lib/stores/eventiStore.js';
	import { fade } from 'svelte/transition';
	import { X, Search, MousePointerClick, Home, Calendar, Clock, Sparkles, Phone } from 'lucide-svelte';

	let eventiAttivi = [];
	let showEventiPopup = false;
	let zoomedImage = null;

	onMount(async () => {
		// Carica eventi attivi
		eventiAttivi = await loadEventiAttivi();
		
		// Mostra popup solo al primo accesso (sessione)
		const hasSeenEventiPopup = sessionStorage.getItem('hasSeenEventiPopup');
		if (!hasSeenEventiPopup && eventiAttivi.length > 0) {
			showEventiPopup = true;
			sessionStorage.setItem('hasSeenEventiPopup', 'true');
		}
	});

	function formatData(isoDate) {
		const date = new Date(isoDate);
		return date.toLocaleDateString('it-IT', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	}

	$: categories = $categoriesStore.map(c => c.name);

	let selectedCategory = null;
	let selectedSubcategory = null;
	let searchTerm = '';
	let selectedProduct = null;

	$: subcategories = selectedCategory ? getSubcategoriesForCategory($categoriesStore, selectedCategory) : [];
	
	// Helper to get category name from ID
	function getCategoryName(categoryId) {
		const cat = $categoriesStore.find(c => c.id === categoryId);
		return cat ? cat.name : '';
	}

	$: filteredItems = $menuStore.filter(item => {
		const matchesSearch = searchTerm === '' || 
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
		
		const itemCategoryName = getCategoryName(item.category_id);
		const matchesCategory = !selectedCategory || itemCategoryName === selectedCategory;
		const matchesSubcategory = !selectedSubcategory || item.subcategory === selectedSubcategory;
		
		return matchesSearch && matchesCategory && matchesSubcategory && item.is_available;
	});

	function openProductDetail(product) {
		if (product.image_url) {
			selectedProduct = product;
		}
	}

	function closeDetail() {
		selectedProduct = null;
	}

	function selectCategory(cat) {
		if (selectedCategory === cat) {
			selectedCategory = null;
			selectedSubcategory = null;
		} else {
			selectedCategory = cat;
			selectedSubcategory = null;
		}
	}

	function selectSubcategory(subcat) {
		selectedSubcategory = selectedSubcategory === subcat ? null : subcat;
	}

	function clearFilters() {
		selectedCategory = null;
		selectedSubcategory = null;
		searchTerm = '';
	}
</script>

<svelte:head>
	<title>Menu - Meraki Lainate</title>
</svelte:head>

<div class="menu-page">
	<!-- Popup Eventi Attivi -->
	{#if showEventiPopup && eventiAttivi.length > 0}
		<div class="eventi-popup-overlay" transition:fade on:click={() => showEventiPopup = false}>
			<div class="eventi-popup" on:click|stopPropagation transition:fade={{ delay: 200 }}>
				<button class="popup-close" on:click={() => showEventiPopup = false}>
					<X size={24} />
				</button>
				
				<div class="popup-header">
					<div class="news-badge-popup">NEWS</div>
					<h2>
						<Sparkles size={28} class="inline-icon-title" />
						Eventi in Corso
					</h2>
					<p>Non perdere i nostri eventi speciali!</p>
				</div>

				<div class="popup-eventi-list">
					{#each eventiAttivi as evento}
						<div class="popup-evento-card">
							{#if evento.immagine_url}
								<div class="popup-evento-image" on:click={() => zoomedImage = evento.immagine_url} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && (zoomedImage = evento.immagine_url)}>
									<img src={evento.immagine_url} alt={evento.titolo} />
									<div class="zoom-hint-popup">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
											<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
										</svg>
									</div>
								</div>
							{/if}
							<div class="popup-evento-content">
								<h3>{evento.titolo}</h3>
								<div class="popup-evento-meta">
									<div class="meta-row">
										<Calendar size={16} />
										<span>{formatData(evento.data_inizio)}</span>
									</div>
									{#if evento.orario}
										<div class="meta-row">
											<Clock size={16} />
											<span>{evento.orario}</span>
										</div>
									{/if}
								</div>
								<p>{evento.descrizione}</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="popup-footer">
					<a href="tel:+393516327144" class="btn-prenota">
						<Phone size={20} />
						Prenota Ora
					</a>
					<button class="btn-chiudi" on:click={() => showEventiPopup = false}>
						Continua al Menu
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Image Zoom Modal -->
	{#if zoomedImage}
		<div class="zoom-modal" on:click={() => zoomedImage = null} role="button" tabindex="0" on:keypress={(e) => e.key === 'Escape' && (zoomedImage = null)}>
			<button class="zoom-close" on:click={() => zoomedImage = null}>
				<X size={32} />
			</button>
			<img src={zoomedImage} alt="Evento" class="zoomed-image" on:click|stopPropagation />
		</div>
	{/if}

	<!-- Header -->
	<header class="menu-header">
		<div class="header-content">
			<a href="/" class="logo">MERAKI</a>
			<a href="/" class="back-button">
				<Home size={20} />
				Home
			</a>
		</div>
	</header>

	<!-- Aperitivo Banner -->
	<div class="aperitivo-banner">
		<strong>Aperitivo fino alle 21:00!</strong> Scegli il cocktail che preferisci e con l'aggiunta di € 3,00 
		(€ 5,00 senza glutine o lattosio) avrai una selezione di stuzzichini preparati al momento dal nostro chef!
	</div>

	<!-- Filters -->
	<div class="filters-section">
		<div class="container">
			<!-- Search -->
			<div class="search-box">
				<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"/>
					<path d="m21 21-4.35-4.35"/>
				</svg>
				<input 
					type="text" 
					placeholder="Cerca nel menu..." 
					bind:value={searchTerm}
					class="search-input"
				/>
				{#if searchTerm}
					<button class="clear-btn" on:click={() => searchTerm = ''}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6L6 18M6 6l12 12"/>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Category Pills -->
			<div class="categories">
				{#each categories as cat}
					<button 
						class="category-pill"
						class:active={selectedCategory === cat}
						on:click={() => selectCategory(cat)}
					>
						{cat}
					</button>
				{/each}
				{#if selectedCategory || selectedSubcategory || searchTerm}
					<button class="category-pill reset" on:click={clearFilters}>
						✕ Reset
					</button>
				{/if}
			</div>

			<!-- Subcategories -->
			{#if subcategories.length > 0}
				<div class="subcategories" transition:fade={{ duration: 200 }}>
					{#each subcategories as subcat}
						<button 
							class="subcategory-pill"
							class:active={selectedSubcategory === subcat}
							on:click={() => selectSubcategory(subcat)}
						>
							{subcat}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Results Count -->
			<div class="results-count">
				{filteredItems.length} {filteredItems.length === 1 ? 'prodotto' : 'prodotti'}
			</div>
		</div>
	</div>

	<!-- Menu Items -->
	<div class="menu-items">
		<div class="container">
			{#if filteredItems.length > 0}
				<div class="items-grid">
					{#each filteredItems as item (item.id)}
						<div 
							class="menu-item" 
							class:clickable={item.image_url}
							on:click={() => item.image_url && openProductDetail(item)}
							transition:fade={{ duration: 200 }}
						>
							<div class="item-header">
							<div class="header-top">
								<span class="item-category">{item.subcategory || getCategoryName(item.category_id)}</span>
								{#if item.image_url}
									<span class="click-badge" title="👆 Clicca per vedere dettagli">
										+ Info
									</span>
								{/if}
							</div>
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
								{#if item.note}
									<div class="item-note">{item.note}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10"/>
						<path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01"/>
					</svg>
					<h3>Nessun prodotto trovato</h3>
					<p>Prova a modificare i filtri o la ricerca</p>
					<button class="reset-button" on:click={clearFilters}>Reset Filtri</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Product Detail Modal -->
	{#if selectedProduct}
		<div class="modal-overlay" on:click={closeDetail} transition:fade={{ duration: 200 }}>
			<div class="modal-detail" on:click|stopPropagation>
				<button class="close-modal" on:click={closeDetail}>
					<X size={24} />
				</button>
				
				{#if selectedProduct.image_url}
					<div class="modal-image">
						<img src={selectedProduct.image_url} alt={selectedProduct.name} />
					</div>
				{/if}

				<div class="modal-content">
					<span class="modal-category">{selectedProduct.subcategory || getCategoryName(selectedProduct.category_id)}</span>
					<h2>{selectedProduct.name}</h2>

					{#if selectedProduct.detailed_description}
						<p class="modal-description">{selectedProduct.detailed_description}</p>
					{/if}

					{#if selectedProduct.description}
						<p class="modal-ingredients">Ingredienti: {selectedProduct.description}</p>
					{/if}

					<div class="modal-price">
						{#if selectedProduct.pricing.type === 'multiple'}
							<div class="sizes-list">
								{#each selectedProduct.pricing.variants as variant}
									<div class="size-item">
										<span>{variant.name}</span>
										<span class="price">€ {variant.price.toFixed(2)}</span>
									</div>
								{/each}
							</div>
						{:else if selectedProduct.pricing.type === 'single'}
							<span class="price-large">€ {selectedProduct.pricing.value.toFixed(2)}</span>
						{/if}
					</div>
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
		max-width: 100vw;
		overflow-x: hidden;
	}

	/* Header - Mobile First */
	.menu-header {
		background: var(--bianco);
		border-bottom: 2px solid var(--grigio);
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		width: 100%;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.75rem 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 0.5rem;
	}

	@media (min-width: 768px) {
		.header-content {
			padding: 1.5rem 2rem;
		}
	}

	.logo {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--verde-meraki);
		text-decoration: none;
		white-space: nowrap;
	}

	@media (min-width: 768px) {
		.logo {
			font-size: 2rem;
			letter-spacing: 0.2em;
		}
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.6rem 1rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 500;
		font-size: 0.85rem;
		transition: all 0.3s ease;
	}

	@media (min-width: 768px) {
		.back-button {
			gap: 0.5rem;
			padding: 0.7rem 1.5rem;
			font-size: 1rem;
		}

		.back-button:hover {
			background: var(--verde-light);
			transform: translateX(-3px);
		}
	}

	/* Banner - Mobile First */
	.aperitivo-banner {
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		padding: 1rem 1rem;
		text-align: center;
		font-size: 0.85rem;
		line-height: 1.5;
		width: 100%;
	}

	@media (min-width: 768px) {
		.aperitivo-banner {
			padding: 1.5rem 2rem;
			font-size: 0.95rem;
			line-height: 1.6;
		}
	}

	/* Filters - Mobile First */
	.filters-section {
		background: var(--grigio-chiaro);
		padding: 1.5rem 0;
		border-bottom: 2px solid var(--grigio);
		width: 100%;
	}

	@media (min-width: 768px) {
		.filters-section {
			padding: 2rem 0;
		}
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 0.75rem;
		width: 100%;
		box-sizing: border-box;
	}

	@media (min-width: 768px) {
		.container {
			padding: 0 2rem;
		}
	}

	.search-box {
		position: relative;
		max-width: 600px;
		margin: 0 auto 1.2rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.search-box {
			margin-bottom: 1.5rem;
		}
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--grigio-scuro);
	}

	@media (min-width: 768px) {
		.search-icon {
			left: 1.2rem;
		}
	}

	.search-input {
		width: 100%;
		padding: 0.9rem 2.5rem;
		border: 2px solid var(--grigio);
		border-radius: 50px;
		font-size: 0.95rem;
		background: var(--bianco);
		transition: all 0.3s ease;
	}

	@media (min-width: 768px) {
		.search-input {
			padding: 1rem 3rem;
			font-size: 1rem;
		}
	}

	.search-input:focus {
		outline: none;
		border-color: var(--verde-meraki);
		box-shadow: 0 0 0 3px rgba(21, 67, 21, 0.1);
	}

	.clear-btn {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--grigio-scuro);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		transition: all 0.3s ease;
	}

	.clear-btn:hover {
		background: var(--grigio);
		color: var(--nero);
	}

	/* Categories - Mobile First */
	.categories, .subcategories {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
	}

	@media (min-width: 768px) {
		.categories, .subcategories {
			gap: 0.8rem;
			flex-wrap: wrap;
			justify-content: center;
			overflow-x: visible;
		}
	}

	.category-pill, .subcategory-pill {
		padding: 0.7rem 1.2rem;
		border: 2px solid var(--verde-meraki);
		background: var(--bianco);
		color: var(--verde-meraki);
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	@media (min-width: 768px) {
		.category-pill, .subcategory-pill {
			padding: 0.8rem 1.5rem;
			font-size: 1rem;
		}

		.category-pill:hover, .subcategory-pill:hover {
			background: var(--verde-light);
			color: var(--bianco);
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(21, 67, 21, 0.2);
		}
	}

	.category-pill.active, .subcategory-pill.active {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	.category-pill.reset {
		border-color: var(--grigio-scuro);
		color: var(--grigio-scuro);
	}

	.category-pill.reset:hover {
		background: var(--grigio-scuro);
		color: var(--bianco);
	}

	.results-count {
		text-align: center;
		color: var(--grigio-scuro);
		font-size: 0.9rem;
		margin-top: 1rem;
	}

	/* Menu Items - Mobile First */
	.menu-items {
		padding: 2rem 0 3rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.menu-items {
			padding: 3rem 0 4rem;
		}
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

	@media (min-width: 1024px) {
		.items-grid {
			grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
			gap: 2rem;
		}
	}

	.menu-item {
		background: var(--bianco);
		border: 2px solid var(--grigio);
		border-radius: 16px;
		padding: 1.2rem;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.menu-item {
			padding: 1.5rem;
		}

		.menu-item:hover {
			border-color: var(--verde-meraki);
			box-shadow: 0 8px 24px rgba(21, 67, 21, 0.15);
			transform: translateY(-5px);
		}
	}

	.menu-item.clickable {
		cursor: pointer;
	}

	.menu-item.clickable:hover {
		border-color: var(--verde-light);
	}

	.item-header {
		flex: 1;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.8rem;
	}

	.item-category {
		display: inline-block;
		padding: 0.3rem 0.8rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.click-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.3rem 0.8rem;
		background: transparent;
		color: var(--verde-meraki);
		border: 2px solid var(--verde-meraki);
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		animation: clickPulse 1.5s ease-in-out infinite;
		cursor: pointer;
	}

	@keyframes clickPulse {
		0%, 100% { 
			transform: scale(1);
			border-color: var(--verde-meraki);
		}
		50% { 
			transform: scale(1.05);
			border-color: var(--verde-light);
		}
	}

	.item-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--nero);
		margin-bottom: 0.5rem;
	}

	@media (min-width: 768px) {
		.item-name {
			font-size: 1.4rem;
		}
	}

	.item-description {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		line-height: 1.5;
	}

	@media (min-width: 768px) {
		.item-description {
			font-size: 0.9rem;
		}
	}

	.item-footer {
		border-top: 1px solid var(--grigio);
		padding-top: 1rem;
	}

	.item-price {
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--verde-meraki);
		text-align: right;
	}

	@media (min-width: 768px) {
		.item-price {
			font-size: 2rem;
		}
	}

	.sizes {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	@media (min-width: 768px) {
		.sizes {
			gap: 0.8rem;
		}
	}

	.size-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.6rem 1rem;
		background: var(--grigio-chiaro);
		border: 1px solid var(--grigio);
		border-radius: 12px;
		gap: 0.2rem;
	}

	.size-name {
		font-size: 0.75rem;
		color: var(--grigio-scuro);
		text-transform: uppercase;
		font-weight: 600;
	}

	.size-price {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	.item-note {
		margin-top: 0.8rem;
		padding: 0.8rem;
		background: var(--grigio-chiaro);
		border-left: 3px solid var(--verde-meraki);
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		border-radius: 4px;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--grigio-scuro);
	}

	.empty-state svg {
		margin-bottom: 1.5rem;
		opacity: 0.3;
	}

	.empty-state h3 {
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
		color: var(--nero);
	}

	.empty-state p {
		margin-bottom: 2rem;
	}

	.reset-button {
		padding: 1rem 2rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.reset-button:hover {
		background: var(--verde-light);
		transform: translateY(-2px);
	}

	/* Product Detail Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 1rem;
		overflow-y: auto;
	}

	.modal-detail {
		background: var(--bianco);
		border-radius: 16px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
	}

	.close-modal {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		transition: all 0.3s ease;
	}

	.close-modal:hover {
		background: rgba(0, 0, 0, 0.7);
		transform: rotate(90deg);
	}

	.modal-image {
		width: 100%;
		height: 300px;
		overflow: hidden;
		border-radius: 16px 16px 0 0;
	}

	.modal-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-content {
		padding: 2rem;
	}

	.modal-category {
		display: inline-block;
		padding: 0.4rem 1rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 1rem;
	}

	.modal-content h2 {
		font-size: 2rem;
		color: var(--verde-meraki);
		margin-bottom: 1rem;
	}

	.modal-description {
		font-size: 1.1rem;
		line-height: 1.7;
		color: var(--nero);
		margin-bottom: 1.5rem;
	}

	.modal-ingredients {
		font-size: 0.95rem;
		color: var(--grigio-scuro);
		font-style: italic;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--grigio-chiaro);
		border-radius: 8px;
	}

	.modal-price {
		border-top: 2px solid var(--grigio);
		padding-top: 1.5rem;
	}

	.price-large {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	.sizes-list {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.size-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--grigio-chiaro);
		border-radius: 8px;
	}

	.size-item .price {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	@media (max-width: 768px) {
		.modal-image {
			height: 200px;
		}

		.modal-content {
			padding: 1.5rem;
		}

		.modal-content h2 {
			font-size: 1.5rem;
		}
	}

	/* Popup Eventi */
	.eventi-popup-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 1rem;
		overflow-y: auto;
	}

	.eventi-popup {
		background: var(--bianco);
		border-radius: 24px;
		max-width: 500px;
		width: 100%;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		margin: auto;
	}

	.popup-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--grigio-chiaro);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10;
	}

	.popup-close:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
		transform: rotate(90deg);
	}

	.popup-header {
		text-align: center;
		padding: 1.5rem 1.5rem 1rem;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		border-radius: 24px 24px 0 0;
		position: relative;
	}

	.news-badge-popup {
		display: inline-block;
		padding: 0.4rem 0.8rem;
		background: #FF4444;
		color: white;
		font-weight: 800;
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		border-radius: 6px;
		margin-bottom: 0.8rem;
		animation: pulse 2s ease-in-out infinite;
	}

	.popup-header h2 {
		font-size: 1.6rem;
		margin: 0.5rem 0 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
	}

	.inline-icon-title {
		display: inline-flex;
		vertical-align: middle;
	}

	.popup-header p {
		font-size: 0.95rem;
		opacity: 0.95;
		margin: 0;
	}

	.popup-eventi-list {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.popup-evento-card {
		border: 2px solid var(--grigio);
		border-radius: 16px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.popup-evento-card:hover {
		border-color: var(--verde-meraki);
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.15);
	}

	.popup-evento-image {
		width: 100%;
		height: 160px;
		overflow: hidden;
		position: relative;
		cursor: zoom-in;
	}

	.popup-evento-image:hover img {
		transform: scale(1.05);
	}

	.popup-evento-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.zoom-hint-popup {
		position: absolute;
		bottom: 0.8rem;
		right: 0.8rem;
		width: 36px;
		height: 36px;
		background: rgba(21, 67, 21, 0.9);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		z-index: 2;
	}

	.popup-evento-image:hover .zoom-hint-popup {
		opacity: 1;
	}

	.popup-evento-content {
		padding: 1rem;
	}

	.popup-evento-content h3 {
		color: var(--verde-meraki);
		font-size: 1.3rem;
		margin-bottom: 0.8rem;
	}

	.popup-evento-meta {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.8rem;
	}

	.meta-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--grigio-scuro);
		font-size: 0.95rem;
	}

	.popup-evento-content p {
		color: var(--nero);
		line-height: 1.6;
	}

	.popup-footer {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		border-top: 2px solid var(--grigio);
	}

	.btn-prenota {
		padding: 0.9rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		text-align: center;
		border-radius: 50px;
		font-weight: 700;
		font-size: 1rem;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-prenota:hover {
		background: var(--verde-light);
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(21, 67, 21, 0.3);
	}

	.btn-chiudi {
		padding: 0.8rem 2rem;
		background: transparent;
		color: var(--grigio-scuro);
		border: 2px solid var(--grigio);
		border-radius: 50px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-chiudi:hover {
		background: var(--grigio-chiaro);
		border-color: var(--verde-meraki);
		color: var(--verde-meraki);
	}

	/* Image Zoom Modal */
	.zoom-modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 10001;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		cursor: zoom-out;
		animation: fadeInZoom 0.3s ease;
	}

	@keyframes fadeInZoom {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.zoom-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 50px;
		height: 50px;
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid white;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10002;
	}

	.zoom-close:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: rotate(90deg);
	}

	.zoomed-image {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: zoomInImage 0.3s ease;
		cursor: default;
	}

	@keyframes zoomInImage {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (max-width: 640px) {
		.eventi-popup {
			margin: 0.5rem;
			border-radius: 20px;
		}

		.popup-header {
			padding: 1.2rem 1rem 0.8rem;
			border-radius: 20px 20px 0 0;
		}

		.popup-header h2 {
			font-size: 1.4rem;
		}

		.popup-header p {
			font-size: 0.9rem;
		}

		.popup-eventi-list {
			padding: 0.8rem;
			max-height: 300px;
		}

		.popup-evento-image {
			height: 140px;
		}

		.popup-evento-content {
			padding: 0.8rem;
		}

		.popup-evento-content h3 {
			font-size: 1.1rem;
		}

		.popup-footer {
			padding: 0.8rem;
		}

		.btn-prenota {
			padding: 0.8rem 1.2rem;
			font-size: 0.95rem;
		}

		.btn-chiudi {
			padding: 0.7rem 1.2rem;
			font-size: 0.9rem;
		}
	}
</style>

