<script>
	import { onMount, tick } from 'svelte';
	import { categoriesStore } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade } from 'svelte/transition';
	import { X, Search, Home } from 'lucide-svelte';

	// Macro-categorie
	const MACRO_CATEGORIES = [
		{ name: 'Cocktail', icon: '🍸', keywords: ['cocktail', 'spirit', 'drink', 'aperitivo'] },
		{ name: 'Birre e Vini', icon: '🍷', keywords: ['birr', 'vino', 'vini', 'wine', 'beer', 'bollicine', 'prosecco'] },
		{ name: 'Cucina', icon: '🍽️', keywords: ['cucina', 'antipast', 'primo', 'second', 'dolc', 'pizza', 'panin', 'taglier', 'food'] }
	];

	let selectedMacro = MACRO_CATEGORIES[0].name;
	let activeSection = null;
	let searchTerm = '';
	let searchExpanded = false;
	let selectedProduct = null;
	let sectionRefs = {};
	let scrollContainer;

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

	// Intersection Observer per sticky sections
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						activeSection = entry.target.dataset.section;
					}
				});
			},
			{ rootMargin: '-100px 0px -70% 0px', threshold: 0 }
		);

		// Observe dopo che le sezioni sono renderizzate
		setTimeout(() => {
			Object.values(sectionRefs).forEach(ref => {
				if (ref) observer.observe(ref);
			});
		}, 100);

		return () => observer.disconnect();
	});

	async function selectMacro(macro) {
		selectedMacro = macro;
		await tick();
		// Reset scroll
		if (scrollContainer) {
			scrollContainer.scrollTop = 0;
		}
	}

	function scrollToSection(categoryName) {
		const el = sectionRefs[categoryName];
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function toggleSearch() {
		searchExpanded = !searchExpanded;
		if (!searchExpanded) searchTerm = '';
	}

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
	<title>Menu V3 - Sticky Sections | Meraki</title>
</svelte:head>

<div class="menu-page">
	<!-- Header fisso -->
	<header class="menu-header">
		<div class="header-content">
			<a href="/" class="logo">MERAKI</a>
			<div class="header-actions">
				<span class="version-badge">V3 - Sticky</span>
				<a href="/menu-demo" class="back-button">
					<Home size={18} />
					Demo
				</a>
			</div>
		</div>
	</header>

	<!-- MACRO TABS fissi -->
	<div class="macro-tabs-sticky">
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

	<!-- Subcategory Pills (quick jump) -->
	{#if currentCategories.length > 0 && !searchExpanded}
		<div class="subcategory-pills">
			{#each currentCategories as cat}
				<button 
					class="pill"
					class:active={activeSection === cat.name}
					on:click={() => scrollToSection(cat.name)}
				>
					{cat.name}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Search (overlay) -->
	{#if searchExpanded}
		<div class="search-overlay" transition:fade>
			<div class="search-box">
				<Search size={20} />
				<input 
					type="text" 
					placeholder="Cerca nel menu..." 
					bind:value={searchTerm}
					autofocus
				/>
				<button on:click={toggleSearch}>
					<X size={20} />
				</button>
			</div>
			
			{#if searchResults.length > 0}
				<div class="search-results">
					{#each searchResults as item (item.id)}
						<div class="search-item" on:click={() => { openProductDetail(item); toggleSearch(); }}>
							{#if item.image_url}
								<img src={item.image_url} alt={item.name} />
							{/if}
							<div class="search-item-info">
								<span class="name">{item.name}</span>
								{#if item.pricing.type === 'single'}
									<span class="price">€ {item.pricing.value.toFixed(2)}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else if searchTerm.trim()}
				<p class="no-results">Nessun risultato</p>
			{/if}
		</div>
	{/if}

	<!-- Floating Search Button -->
	{#if !searchExpanded}
		<button class="fab-search" on:click={toggleSearch}>
			<Search size={24} />
		</button>
	{/if}

	<!-- Scrollable Content -->
	<div class="scroll-content" bind:this={scrollContainer}>
		<!-- Banner -->
		<div class="aperitivo-banner">
			<strong>Aperitivo fino alle 21:00!</strong> Aggiungi € 3,00 per stuzzichini!
		</div>

		<!-- Menu Sections -->
		{#each currentCategories as category}
			{@const items = getItemsForCategory(category.id)}
			{#if items.length > 0}
				<section 
					class="menu-section" 
					data-section={category.name}
					bind:this={sectionRefs[category.name]}
				>
					<!-- Sticky Section Header -->
					<div class="section-header">
						<h2>{category.name}</h2>
						<span class="item-count">{items.length} prodotti</span>
					</div>

					<!-- Items Grid -->
					<div class="section-items">
						{#each items as item (item.id)}
							<div 
								class="menu-card"
								class:has-image={item.image_url}
								on:click={() => openProductDetail(item)}
							>
								{#if item.image_url}
									<div class="card-image">
										<img src={item.image_url} alt={item.name} loading="lazy" />
									</div>
								{/if}
								<div class="card-content">
									<h3>{item.name}</h3>
									{#if item.description}
										<p>{item.description}</p>
									{/if}
									<div class="card-price">
										{#if item.pricing.type === 'multiple'}
											{#each item.pricing.variants as variant}
												<span class="variant">
													{variant.name}: <strong>€ {variant.price.toFixed(2)}</strong>
												</span>
											{/each}
										{:else if item.pricing.type === 'single'}
											<strong>€ {item.pricing.value.toFixed(2)}</strong>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/each}

		<!-- Footer spacer -->
		<div class="footer-spacer"></div>
	</div>

	<!-- Modal -->
	{#if selectedProduct}
		<div class="modal-overlay" on:click={closeDetail} transition:fade={{ duration: 250 }}>
			<div class="modal-detail" on:click|stopPropagation>
				<div class="modal-hero">
					{#if selectedProduct.image_url}
						<img src={selectedProduct.image_url} alt={selectedProduct.name} class="hero-img" />
					{/if}
					<button class="close-modal" on:click={closeDetail}>
						<X size={24} />
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
		display: flex;
		flex-direction: column;
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
		background: #9b59b6;
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

	/* MACRO TABS - Sticky sotto header */
	.macro-tabs-sticky {
		display: flex;
		background: var(--verde-meraki);
		position: sticky;
		top: 52px;
		z-index: 150;
	}

	.macro-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.9rem 0.5rem;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s;
		border-bottom: 3px solid transparent;
	}

	.macro-tab:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	.macro-tab.active {
		color: white;
		border-bottom-color: white;
		background: rgba(255, 255, 255, 0.15);
	}

	.tab-icon {
		font-size: 1.3rem;
	}

	.tab-name {
		font-weight: 600;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	@media (min-width: 768px) {
		.tab-name {
			font-size: 1rem;
		}

		.tab-icon {
			font-size: 1.5rem;
		}
	}

	/* Subcategory Pills */
	.subcategory-pills {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--bianco);
		border-bottom: 1px solid var(--grigio);
		overflow-x: auto;
		position: sticky;
		top: 100px;
		z-index: 140;
	}

	.subcategory-pills::-webkit-scrollbar {
		display: none;
	}

	.pill {
		padding: 0.5rem 1rem;
		background: var(--grigio-chiaro);
		border: 1.5px solid var(--grigio);
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--grigio-scuro);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.pill:hover {
		border-color: var(--verde-meraki);
		color: var(--verde-meraki);
	}

	.pill.active {
		background: var(--verde-meraki);
		border-color: var(--verde-meraki);
		color: white;
	}

	/* Floating Search Button */
	.fab-search {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		width: 56px;
		height: 56px;
		background: var(--verde-meraki);
		color: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 4px 20px rgba(21, 67, 21, 0.4);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: all 0.3s;
	}

	.fab-search:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 25px rgba(21, 67, 21, 0.5);
	}

	/* Search Overlay */
	.search-overlay {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.98);
		z-index: 300;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.2rem;
		background: var(--grigio-chiaro);
		border: 2px solid var(--verde-meraki);
		border-radius: 16px;
		margin-bottom: 1rem;
	}

	.search-box input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1.1rem;
		outline: none;
	}

	.search-box button {
		background: var(--grigio);
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.search-results {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.search-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--bianco);
		border: 1px solid var(--grigio);
		border-radius: 12px;
		cursor: pointer;
	}

	.search-item:hover {
		border-color: var(--verde-meraki);
	}

	.search-item img {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 10px;
	}

	.search-item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.search-item-info .name {
		font-weight: 600;
		font-size: 1rem;
	}

	.search-item-info .price {
		color: var(--verde-meraki);
		font-weight: 600;
	}

	.no-results {
		text-align: center;
		color: var(--grigio-scuro);
		padding: 2rem;
	}

	/* Scroll Content */
	.scroll-content {
		flex: 1;
		overflow-y: auto;
	}

	.aperitivo-banner {
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-light) 100%);
		color: var(--bianco);
		padding: 0.75rem 1rem;
		text-align: center;
		font-size: 0.85rem;
	}

	/* Menu Section */
	.menu-section {
		padding: 0 1rem;
	}

	.section-header {
		position: sticky;
		top: 148px;
		background: var(--grigio-chiaro);
		padding: 1rem 0;
		margin-bottom: 1rem;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		border-bottom: 2px solid var(--verde-meraki);
		z-index: 50;
	}

	.section-header h2 {
		font-family: 'Bebas Neue', 'Playfair Display', serif;
		font-size: 1.5rem;
		color: var(--verde-meraki);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.item-count {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
	}

	.section-items {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		padding-bottom: 2rem;
	}

	@media (min-width: 640px) {
		.section-items {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.section-items {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Menu Card */
	.menu-card {
		background: var(--bianco);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		cursor: pointer;
		transition: all 0.3s;
	}

	.menu-card:hover {
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.15);
		transform: translateY(-4px);
	}

	.card-image {
		height: 140px;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s;
	}

	.menu-card:hover .card-image img {
		transform: scale(1.08);
	}

	.card-content {
		padding: 1rem;
	}

	.card-content h3 {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.2rem;
		color: var(--verde-meraki);
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
	}

	.card-content p {
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

	.card-price {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.95rem;
		color: var(--verde-meraki);
	}

	.card-price .variant {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
	}

	.card-price .variant strong {
		color: var(--verde-meraki);
	}

	.footer-spacer {
		height: 100px;
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
	}

	.modal-hero {
		position: relative;
		height: 280px;
		overflow: hidden;
		background: var(--grigio);
	}

	.hero-img {
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
	}

	.modal-story {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--grigio);
		color: #666;
		font-style: italic;
	}
</style>
