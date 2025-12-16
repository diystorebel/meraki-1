<script>
	import { onMount } from 'svelte';
	import { categoriesStore, getSubcategoriesForCategory } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { loadEventiAttivi } from '$lib/stores/eventiStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade, fly } from 'svelte/transition';
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
	let searchExpanded = false;
	let showScrollHint = true;

	function handleCategoriesScroll(e) {
		const el = e.target;
		const scrollEnd = el.scrollWidth - el.clientWidth;
		// Nascondi la freccia se siamo quasi alla fine
		showScrollHint = el.scrollLeft < scrollEnd - 10;
	}

	$: subcategories = selectedCategory ? getSubcategoriesForCategory($categoriesStore, selectedCategory) : [];
	
	// Helper to get category name from ID
	function getCategoryName(categoryId) {
		const cat = $categoriesStore.find(c => c.id === categoryId);
		return cat ? cat.name : '';
	}

	// Smart Search: usa ricerca semantica con sinonimi e word boundaries
	$: filteredItems = (() => {
		// Filtra solo items disponibili
		const availableItems = $menuStore.filter(item => item.is_available);
		
		// Se c'è una ricerca attiva, usa smart search (ignora categoria/sottocategoria)
		if (searchTerm && searchTerm.trim() !== '') {
			return smartSearch(availableItems, searchTerm);
		}
		
		// Altrimenti filtra per categoria/sottocategoria
		return availableItems.filter(item => {
			const itemCategoryName = getCategoryName(item.category_id);
			const matchesCategory = !selectedCategory || itemCategoryName === selectedCategory;
			const matchesSubcategory = !selectedSubcategory || item.subcategory === selectedSubcategory;
			return matchesCategory && matchesSubcategory;
		});
	})();

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
		searchExpanded = false;
	}

	function toggleSearch() {
		searchExpanded = !searchExpanded;
		if (!searchExpanded) {
			searchTerm = '';
		}
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
			<!-- Search espanso OPPURE Categories -->
			{#if searchExpanded || searchTerm}
				<!-- Modalità ricerca: barra full width -->
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
				<!-- Modalità normale: chips categorie -->
				<div class="categories-container">
					<div class="categories-row" on:scroll={handleCategoriesScroll}>
						<button class="search-btn" on:click={toggleSearch}>
							<Search size={18} />
						</button>
						
						{#each categories as cat}
							<button 
								class="cat-btn"
								class:active={selectedCategory === cat}
								on:click={() => selectCategory(cat)}
							>
								{cat}
							</button>
						{/each}
						
						{#if selectedCategory || selectedSubcategory}
							<button class="reset-btn" on:click={clearFilters}>
								<X size={14} />
							</button>
						{/if}
					</div>
					{#if showScrollHint}
						<div class="scroll-hint" transition:fade={{ duration: 200 }}>›</div>
					{/if}
				</div>
			{/if}

			<!-- Subcategories (nascoste durante la ricerca) -->
			{#if selectedCategory && subcategories.length > 0 && !searchExpanded && !searchTerm}
				<div class="subcategories-container" transition:fade={{ duration: 150 }}>
					<div class="subcategories-row">
						{#each subcategories as subcat}
							<button 
								class="subcat-btn"
								class:active={selectedSubcategory === subcat}
								on:click={() => selectSubcategory(subcat)}
							>
								{subcat}
							</button>
						{/each}
					</div>
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
						<!-- Card CON FOTO - Layout premium con immagine sfondo -->
						<div 
							class="menu-item menu-item-premium" 
							on:click={() => openProductDetail(item)}
							transition:fade={{ duration: 200 }}
						>
							<!-- Immagine di sfondo -->
							<div class="premium-bg">
								<img src={item.image_url} alt={item.name} loading="lazy" />
								<div class="premium-overlay"></div>
							</div>
							
							<!-- Contenuto sopra l'immagine -->
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
						<!-- Card SENZA FOTO - Layout standard -->
						<div 
							class="menu-item" 
							transition:fade={{ duration: 200 }}
						>
							<div class="item-header">
								<div class="item-title-row">
									<h3 class="item-name">{item.name}</h3>
									{#if item.pricing.type === 'single'}
										<span class="item-price-inline">€ {item.pricing.value.toFixed(2)}</span>
									{/if}
								</div>
								{#if item.description}
									<p class="item-description">{item.description}</p>
								{/if}
							</div>
							{#if item.pricing.type === 'multiple' || item.note}
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
									{/if}
									{#if item.note}
										<div class="item-note">{item.note}</div>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
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
		<div class="modal-overlay" on:click={closeDetail} transition:fade={{ duration: 250 }}>
			<div class="modal-detail" on:click|stopPropagation>
				<!-- Header con immagine hero -->
				<div class="modal-hero">
					{#if selectedProduct.image_url}
						<img src={selectedProduct.image_url} alt={selectedProduct.name} class="hero-img" />
					{/if}
					<div class="hero-gradient"></div>
					
				<!-- Close button -->
				<button class="close-modal" on:click={closeDetail}>
					<X size={20} />
				</button>
				</div>

				<!-- Content -->
				<div class="modal-body">
					<div class="modal-header">
						<h2>{selectedProduct.name}</h2>
						{#if selectedProduct.description}
							<p class="ingredients">{selectedProduct.description}</p>
						{/if}
					</div>

					{#if selectedProduct.detailed_description}
						<div class="description-block">
							<p>{selectedProduct.detailed_description}</p>
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
		font-size: 0.95rem;
		line-height: 1.5;
		width: 100%;
	}

	@media (min-width: 768px) {
		.aperitivo-banner {
			padding: 1.5rem 2rem;
			font-size: 1.05rem;
			line-height: 1.6;
		}
	}

	/* Filters - Mobile First */
	.filters-section {
		background: var(--grigio-chiaro);
		padding: 1.5rem 0;
		border-bottom: 2px solid var(--grigio);
		width: 100%;
		overflow-x: hidden;
		max-width: 100vw;
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
		overflow-x: hidden;
	}

	@media (min-width: 768px) {
		.container {
			padding: 0 2rem;
		}
	}

	/* Search Expanded - Full width, stessa altezza del bottone */
	.search-expanded {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bianco);
		border: 1.5px solid var(--verde-meraki);
		border-radius: 20px;
		padding: 0 0.8rem;
		height: 42px;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		min-width: 0;
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
		padding: 0;
		min-width: 0;
		width: 100%;
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
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.search-close-btn:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	/* Categories Container */
	.categories-container {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	/* Categories Row */
	.categories-row {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		align-items: center;
		padding-right: 25px;
	}

	.categories-row::-webkit-scrollbar {
		display: none;
	}

	/* Scroll Hint - freccia animata */
	.scroll-hint {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--verde-meraki);
		animation: bounceRight 1.5s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes bounceRight {
		0%, 100% { transform: translateY(-50%) translateX(0); opacity: 1; }
		50% { transform: translateY(-50%) translateX(-4px); opacity: 0.6; }
	}

	@media (min-width: 768px) {
		.categories-row {
			flex-wrap: wrap;
			overflow-x: visible;
			padding-right: 0;
		}

		.scroll-hint {
			display: none;
		}
	}

	/* Search Button (chip) */
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
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.search-btn:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	.cat-btn {
		padding: 0.6rem 1.2rem;
		border: 1.5px solid var(--verde-meraki);
		background: var(--bianco);
		color: var(--verde-meraki);
		border-radius: 20px;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.cat-btn:hover {
		background: var(--verde-light);
		color: var(--bianco);
	}

	.cat-btn.active {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	/* Reset button inline */
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
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.reset-btn:hover {
		border-color: #c00;
		background: #fee;
		color: #c00;
	}

	/* Subcategories Container */
	.subcategories-container {
		position: relative;
		width: 100%;
		overflow: hidden;
		margin-top: 0.6rem;
	}

	/* Subcategories Row - scrolling orizzontale come categories */
	.subcategories-row {
		display: flex;
		gap: 0.4rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		align-items: center;
		padding-right: 10px;
	}

	.subcategories-row::-webkit-scrollbar {
		display: none;
	}

	@media (min-width: 768px) {
		.subcategories-row {
			flex-wrap: wrap;
			overflow-x: visible;
			padding-right: 0;
		}
	}

	.subcat-btn {
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--verde-light);
		background: transparent;
		color: var(--verde-meraki);
		border-radius: 15px;
		font-weight: 500;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.subcat-btn:hover {
		background: var(--verde-light);
		color: var(--bianco);
	}

	.subcat-btn.active {
		background: var(--verde-light);
		color: var(--bianco);
	}

	/* Menu Items - Mobile First */
	.menu-items {
		padding: 2rem 0 3rem;
		width: 100%;
		overflow-x: hidden;
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

	/* ========== CARD STANDARD (senza foto) ========== */
	.menu-item {
		background: var(--bianco);
		border: 2px solid var(--grigio);
		border-radius: 16px;
		padding: 1.2rem;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		overflow: hidden;
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

	/* ========== CARD PREMIUM (con foto sfondo) ========== */
	.menu-item-premium {
		min-height: 180px;
		cursor: pointer;
		border: none;
		padding: 0;
		background: transparent;
	}

	.menu-item-premium:hover {
		transform: translateY(-8px) scale(1.01);
		box-shadow: 0 16px 40px rgba(21, 67, 21, 0.25);
	}

	/* Immagine di sfondo */
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
		transition: transform 0.7s ease;
	}

	.menu-item-premium:hover .premium-bg img {
		transform: scale(1.08);
	}

	/* Overlay gradient scuro */
	.premium-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to right,
			rgba(21, 67, 21, 0.95) 0%,
			rgba(21, 67, 21, 0.85) 35%,
			rgba(21, 67, 21, 0.70) 60%,
			rgba(21, 67, 21, 0.3) 100%
		);
	}

	/* Contenuto sopra l'immagine */
	.premium-content {
		position: relative;
		z-index: 2;
		padding: 1.5rem;
		height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 180px;
	}

	.premium-content .item-name {
		color: var(--bianco);
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.premium-content .item-description {
		color: var(--bianco);
		flex: 1;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5);
		line-height: 1.6;
		font-weight: 400;
	}

	/* Footer della card premium */
	.premium-footer {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.premium-footer .click-badge {
		background: var(--bianco);
		color: var(--verde-meraki);
		border: none;
		font-weight: 800;
		flex-shrink: 0;
	}

	.premium-footer .item-price {
		color: var(--bianco);
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		margin-left: auto;
	}

	.premium-footer .sizes {
		margin-left: auto;
	}

	.premium-footer .size-name {
		color: rgba(255, 255, 255, 0.75);
	}

	.premium-footer .size-price {
		color: var(--bianco);
	}

	@media (min-width: 768px) {
		.premium-content {
			padding: 2rem;
			min-height: 200px;
		}

		.menu-item-premium {
			min-height: 200px;
		}
	}

	.item-header {
		flex: 1;
		position: relative;
		z-index: 1;
	}

	/* Titolo e prezzo inline per card normali */
	.item-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.item-title-row .item-name {
		flex: 1;
		margin-bottom: 0.3rem;
	}

	.item-price-inline {
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--verde-meraki);
		white-space: nowrap;
		flex-shrink: 0;
	}

	@media (min-width: 768px) {
		.item-price-inline {
			font-size: 1.5rem;
		}
	}

	.click-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 1rem;
		background: transparent;
		color: var(--verde-meraki);
		border: 2px solid var(--verde-meraki);
		border-radius: 20px;
		font-size: 0.85rem;
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
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--nero);
		margin-bottom: 0.5rem;
		text-transform: lowercase;
	}

	.item-name::first-letter {
		text-transform: uppercase;
	}

	@media (min-width: 768px) {
		.item-name {
			font-size: 1.6rem;
		}
	}

	.item-description {
		font-size: 1rem;
		color: var(--grigio-scuro);
		line-height: 1.5;
	}

	@media (min-width: 768px) {
		.item-description {
			font-size: 1.1rem;
		}
	}

	.item-footer {
		border-top: 1px solid var(--grigio);
		padding-top: 1rem;
		position: relative;
		z-index: 1;
	}

	.item-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--verde-meraki);
		text-align: right;
	}

	@media (min-width: 768px) {
		.item-price {
			font-size: 1.7rem;
		}
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
		font-size: 0.95rem;
		color: var(--grigio-scuro);
		font-weight: 500;
	}

	.size-price {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	@media (min-width: 768px) {
		.size-name {
			font-size: 1.05rem;
		}

		.size-price {
			font-size: 1.3rem;
		}
	}

	.item-note {
		margin-top: 0.8rem;
		padding: 0.8rem;
		background: var(--grigio-chiaro);
		border-left: 3px solid var(--verde-meraki);
		font-size: 1rem;
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

	/* Product Detail Modal - Redesigned */
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
		overflow-y: auto;
	}

	.modal-detail {
		background: #fafaf8;
		border-radius: 24px;
		max-width: 420px;
		width: 100%;
		max-height: 85vh;
		overflow: hidden;
		position: relative;
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.1),
			0 20px 50px -10px rgba(0, 0, 0, 0.5);
		animation: modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes modalPop {
		0% {
			opacity: 0;
			transform: scale(0.9) translateY(20px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Hero section con immagine */
	.modal-hero {
		position: relative;
		height: 200px;
		overflow: hidden;
		background: linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%);
	}

	.hero-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		animation: heroZoom 0.6s ease-out;
	}

	@keyframes heroZoom {
		from {
			transform: scale(1.1);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.hero-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			transparent 50%,
			rgba(250, 250, 248, 0.6) 75%,
			rgba(250, 250, 248, 0.9) 90%,
			#fafaf8 100%
		);
		pointer-events: none;
	}

	/* Rimuove qualsiasi linea di stacco */
	.modal-hero::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 20px;
		background: linear-gradient(to bottom, transparent, #fafaf8);
	}

	/* Close button - minimal */
	.close-modal {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.9);
		border: none;
		border-radius: 50%;
		color: #333;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.close-modal:hover {
		background: #fff;
		transform: scale(1.1);
	}

	/* Body content */
	.modal-body {
		padding: 20px 24px 28px;
		overflow-y: auto;
		max-height: calc(85vh - 200px);
	}

	.modal-header {
		margin-bottom: 16px;
	}

	.modal-header h2 {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 8px;
		line-height: 1.3;
		text-transform: capitalize;
	}

	.ingredients {
		font-size: 0.85rem;
		color: #666;
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}

	/* Description block */
	.description-block {
		background: #fff;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 16px;
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	.description-block p {
		font-size: 0.9rem;
		line-height: 1.65;
		color: #444;
		margin: 0;
	}

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.modal-overlay {
			padding: 1rem;
			align-items: center;
		}

		.modal-detail {
			max-width: 100%;
			max-height: 85vh;
			border-radius: 20px;
		}

		.modal-hero {
			height: 180px;
		}

		.modal-body {
			padding: 16px 20px 24px;
			max-height: calc(85vh - 180px);
		}

		.modal-header h2 {
			font-size: 1.35rem;
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

