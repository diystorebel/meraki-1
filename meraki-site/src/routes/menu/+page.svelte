<script>
	import { onMount } from 'svelte';
	import { categoriesStore } from '$lib/stores/categoriesStore.js';
	import { menuStore } from '$lib/stores/menuStore.js';
	import { eventiStore, loadEventiVisibili, getStatoEvento, getBadgeText } from '$lib/stores/eventiStore.js';
	import { smartSearch } from '$lib/utils/smartSearch.js';
	import { fade, slide } from 'svelte/transition';
	import { X, Search, Home, ChevronDown, ArrowLeft, Calendar, Phone } from 'lucide-svelte';

	// Macro-categorie configurabili - ora usano il campo macro_category dal DB
	const MACRO_CATEGORIES = [
		{ 
			name: 'Drinks', 
			id: 'drink',
			image: '/foto/cocktail.webp',
			icon: '/immagini-categorie/cocktail.webp'
		},
		{ 
			name: 'Birre e Vini', 
			id: 'wines',
			image: '/foto/birre-vini.webp',
			icon: '/immagini-categorie/birre-vini.webp'
		},
		{ 
			name: 'Cucina', 
			id: 'kitchen',
			image: '/foto/cucina.webp',
			icon: '/immagini-categorie/cibo.webp'
		}
	];

	let selectedMacro = MACRO_CATEGORIES[0]; // Default: Drinks
	let openAccordion = null; // formato: "catId" o "catId_subcatName"
	let searchTerm = '';
	let searchFocused = false;
	let selectedProduct = null;
	let categories = [];
	let eventiVisibili = [];
	let showEventoPopup = false;
	let eventoCorrente = null;

	onMount(async () => {
		// Il caricamento dati è gestito dal layout
		
		// Carica eventi visibili (in corso o in arrivo)
		eventiVisibili = await loadEventiVisibili();
		
		// Mostra popup se ci sono eventi E non è già stato mostrato in questa sessione
		if (eventiVisibili.length > 0 && !sessionStorage.getItem('eventoPopupShown')) {
			eventoCorrente = eventiVisibili[0]; // Mostra il primo evento
			showEventoPopup = true;
			sessionStorage.setItem('eventoPopupShown', 'true');
		}
	});

	function getCategoriesForMacro(macro) {
		if (!macro) return [];
		const allCats = $categoriesStore;
		
		const filtered = allCats.filter(cat => {
			return cat.macro_category === macro.id;
		});
		
		return filtered;
	}

	// Ottiene le sottocategorie effettivamente usate (con prodotti) per una categoria
	// Rispetta l'ordine definito in categories.subcategories
	function getUsedSubcategories(categoryId) {
		const category = $categoriesStore.find(c => c.id === categoryId);
		const definedOrder = category?.subcategories || [];
		
		const items = $menuStore.filter(item => item.category_id === categoryId);
		const usedSubcats = new Set(items.map(i => i.subcategory).filter(Boolean));
		
		// Mantieni l'ordine definito, filtrando solo quelle con prodotti
		const orderedUsed = definedOrder.filter(sub => usedSubcats.has(sub));
		
		// Aggiungi eventuali sottocategorie usate ma non definite nell'ordine (alla fine)
		const notInOrder = [...usedSubcats].filter(sub => !definedOrder.includes(sub));
		
		return [...orderedUsed, ...notInOrder];
	}

	// Ottiene i prodotti per una categoria e sottocategoria specifica
	function getItemsForSubcategory(categoryId, subcategory) {
		return $menuStore.filter(item => 
			item.category_id === categoryId && item.subcategory === subcategory
		);
	}

	// Ottiene i prodotti per una categoria (usato quando non ci sono sottocategorie)
	function getItemsForCategory(categoryId) {
		return $menuStore.filter(item => item.category_id === categoryId);
	}

	// Reactive: calcola categories quando cambiano store o macro selezionata
	$: categories = selectedMacro && $categoriesStore.length > 0 
		? getCategoriesForMacro(selectedMacro) 
		: [];
	
	// Loading solo se store vuoti
	$: isLoading = $categoriesStore.length === 0 || $menuStore.length === 0;

	$: filteredItems = (() => {
		if (searchTerm.trim()) {
			return smartSearch([...$menuStore], searchTerm);
		}
		return [];
	})();

	function selectMacro(macro) {
		selectedMacro = macro;
		openAccordion = null;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function toggleAccordion(accordionId) {
		const isCurrentlyOpen = openAccordion === accordionId;
		const willOpen = !isCurrentlyOpen;
		
		openAccordion = isCurrentlyOpen ? null : accordionId;
		
		if (willOpen && typeof window !== 'undefined') {
			setTimeout(() => {
				const element = document.getElementById(`accordion-${accordionId}`);
				if (element) {
					const headerOffset = 100;
					const elementPosition = element.getBoundingClientRect().top;
					const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
					
					window.scrollTo({
						top: offsetPosition,
						behavior: 'smooth'
					});
				}
			}, 350);
		}
	}

	function openProductDetail(product) {
		if (product.image_url) selectedProduct = product;
	}

	function closeDetail() {
		selectedProduct = null;
	}
	
	function closeEventoPopup() {
		showEventoPopup = false;
		eventoCorrente = null;
	}
	
	// Formatta data evento: mostra orario solo se significativo (non 00:00 o 23:59)
	function formatEventoDate(dateString) {
		const date = new Date(dateString);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		
		// Se è mezzanotte (00:00) o quasi fine giornata (23:59), mostra solo la data
		const isFullDay = (hours === 0 && minutes === 0) || (hours === 23 && minutes === 59);
		
		if (isFullDay) {
			return date.toLocaleDateString('it-IT', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		} else {
			return date.toLocaleDateString('it-IT', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	}

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = selectedProduct || showEventoPopup ? 'hidden' : '';
	}
</script>

<svelte:head>
	<title>Menu | Meraki</title>
	<!-- Preload immagine evento se presente -->
	{#if eventoCorrente?.immagine_url}
		<link rel="preload" as="image" href={eventoCorrente.immagine_url} />
	{/if}
</svelte:head>

<div class="app-container">
	<!-- Top Bar -->
	<header class="top-bar">
		<div class="top-bar-row">
			<a href="/" class="logo">MERAKI</a>
			<a href="/" class="back-link">
				<Home size={18} />
			</a>
		</div>
		
		<!-- Search Bar -->
		<div class="search-container" class:focused={searchFocused}>
			<Search size={18} class="search-icon" />
			<input 
				type="text" 
				placeholder="Cerca drink o ingredienti..." 
				bind:value={searchTerm}
				on:focus={() => searchFocused = true}
				on:blur={() => searchFocused = false}
			/>
			{#if searchTerm}
				<button class="clear-search" on:click={() => searchTerm = ''}>
					<X size={16} />
				</button>
			{/if}
		</div>
	</header>

	<!-- Macro Categories - Tab Bar Style -->
	<div class="macro-tabs-container">
		{#each MACRO_CATEGORIES as macro}
			<button 
				class="macro-tab-btn" 
				class:active={selectedMacro.name === macro.name}
				on:click={() => selectMacro(macro)}
			>
				<img src={macro.icon} alt={macro.name} class="macro-icon" />
				<span class="macro-tab-text">{macro.name}</span>
			</button>
		{/each}
	</div>

	<!-- Main Content -->
	<main class="content-area">
		{#if searchTerm.trim()}
			<!-- Search Results -->
			{#if filteredItems.length > 0}
				<div class="products-grid">
					{#each filteredItems as item (item.id)}
						<div 
							class="product-card" 
							class:unavailable={item.is_available === false}
							role="button" 
							tabindex="0"
							on:click={() => item.is_available !== false && item.image_url && openProductDetail(item)}
							on:keydown={(e) => e.key === 'Enter' && item.is_available !== false && item.image_url && openProductDetail(item)}
						>
							{#if item.is_available === false}
								<div class="unavailable-badge">Non disponibile</div>
							{/if}
							<div class="product-info">
								<h3 class="product-name">{item.name}</h3>
								{#if item.description}
									<p class="product-desc">{item.description}</p>
								{/if}
								<div class="product-price">
									{#if item.pricing.type === 'single'}
										€ {item.pricing.value.toFixed(2)}
									{:else}
										Da € {Math.min(...item.pricing.variants.map(v => v.price)).toFixed(2)}
									{/if}
								</div>
							</div>
							{#if item.image_url}
								<div class="product-thumb">
									<img src={item.image_url} alt={item.name} loading="lazy" />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>Nessun risultato trovato</p>
					<button class="reset-btn" on:click={() => searchTerm = ''}>
						Mostra tutto
					</button>
				</div>
			{/if}
		{:else}
			<!-- Menu con categorie e sottocategorie -->
			{#if isLoading}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Caricamento menu...</p>
				</div>
			{:else if categories.length > 0}
				<div class="menu-sections">
					{#each categories as cat (cat.id)}
						{@const usedSubcategories = getUsedSubcategories(cat.id)}
						{@const hasSubcategories = usedSubcategories.length > 0}
						
						{#if hasSubcategories}
							<!-- Categoria CON sottocategorie: header + accordion sottocategorie -->
							<div class="category-section">
								<div class="category-header">
									<h2 class="category-title">{cat.name}</h2>
								</div>
								
								<div class="accordion-container">
									{#each usedSubcategories as subcat}
										{@const accordionId = `${cat.id}_${subcat}`}
										{@const isOpen = openAccordion === accordionId}
										{@const subcatItems = getItemsForSubcategory(cat.id, subcat)}
										
										<div class="accordion-item" id="accordion-{accordionId}">
											<button 
												class="accordion-header" 
												class:open={isOpen}
												on:click={() => toggleAccordion(accordionId)}
											>
												<div class="accordion-header-content">
													<h3 class="accordion-title">{subcat}</h3>
													<p class="accordion-subtitle">{subcatItems.length} prodotti</p>
												</div>
												<ChevronDown 
													size={24} 
													class="accordion-chevron" 
													style="transform: rotate({isOpen ? '180deg' : '0deg'}); transition: transform 0.3s ease;"
												/>
											</button>
											
											{#if isOpen}
												<div class="accordion-content" transition:slide={{ duration: 300 }}>
													{#if subcatItems.length > 0}
														<div class="products-list">
															{#each subcatItems as item (item.id)}
																<div 
																	class="product-card-compact" 
																	class:unavailable={item.is_available === false}
																	class:has-image={item.image_url}
																	style={item.image_url ? `background-image: url('${item.image_url}')` : ''}
																	role="button" 
																	tabindex="0"
																	on:click={() => item.is_available !== false && item.image_url && openProductDetail(item)}
																	on:keydown={(e) => e.key === 'Enter' && item.is_available !== false && item.image_url && openProductDetail(item)}
																>
																	{#if item.is_available === false}
																		<div class="unavailable-badge">Non disponibile</div>
																	{/if}
																	{#if item.image_url}
																		<div class="product-overlay"></div>
																	{/if}
																	<div class="product-info">
																		<div>
																			<h3 class="product-name">{item.name}</h3>
																			{#if item.description}
																				<p class="product-desc">{item.description}</p>
																			{/if}
																		</div>
																		<div class="product-price">
																			{#if item.pricing.type === 'single'}
																				€ {item.pricing.value.toFixed(2)}
																			{:else}
																				<div class="variants-compact">
																					{#each item.pricing.variants as variant}
																						<span class="variant-compact">
																							{variant.name}: <strong>€ {variant.price.toFixed(2)}</strong>
																						</span>
																					{/each}
																				</div>
																			{/if}
																		</div>
																	</div>
																</div>
															{/each}
														</div>
													{:else}
														<p class="no-products">Nessun prodotto disponibile</p>
													{/if}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<!-- Categoria SENZA sottocategorie: accordion diretto -->
							{@const accordionId = `${cat.id}`}
							{@const isOpen = openAccordion === accordionId}
							{@const categoryItems = getItemsForCategory(cat.id)}
							
							<div class="accordion-container">
								<div class="accordion-item" id="accordion-{accordionId}">
									<button 
										class="accordion-header" 
										class:open={isOpen}
										on:click={() => toggleAccordion(accordionId)}
									>
										<div class="accordion-header-content">
											<h3 class="accordion-title">{cat.name}</h3>
											<p class="accordion-subtitle">{categoryItems.length} prodotti</p>
										</div>
										<ChevronDown 
											size={24} 
											class="accordion-chevron" 
											style="transform: rotate({isOpen ? '180deg' : '0deg'}); transition: transform 0.3s ease;"
										/>
									</button>
									
									{#if isOpen}
										<div class="accordion-content" transition:slide={{ duration: 300 }}>
											{#if categoryItems.length > 0}
												<div class="products-list">
													{#each categoryItems as item (item.id)}
														<div 
															class="product-card-compact" 
															class:unavailable={item.is_available === false}
															class:has-image={item.image_url}
															style={item.image_url ? `background-image: url('${item.image_url}')` : ''}
															role="button" 
															tabindex="0"
															on:click={() => item.is_available !== false && item.image_url && openProductDetail(item)}
															on:keydown={(e) => e.key === 'Enter' && item.is_available !== false && item.image_url && openProductDetail(item)}
														>
															{#if item.is_available === false}
																<div class="unavailable-badge">Non disponibile</div>
															{/if}
															{#if item.image_url}
																<div class="product-overlay"></div>
															{/if}
															<div class="product-info">
																<div>
																	<h3 class="product-name">{item.name}</h3>
																	{#if item.description}
																		<p class="product-desc">{item.description}</p>
																	{/if}
																</div>
																<div class="product-price">
																	{#if item.pricing.type === 'single'}
																		€ {item.pricing.value.toFixed(2)}
																	{:else}
																		<div class="variants-compact">
																			{#each item.pricing.variants as variant}
																				<span class="variant-compact">
																					{variant.name}: <strong>€ {variant.price.toFixed(2)}</strong>
																				</span>
																			{/each}
																		</div>
																	{/if}
																</div>
															</div>
														</div>
													{/each}
												</div>
											{:else}
												<p class="no-products">Nessun prodotto disponibile</p>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<p>Nessuna categoria disponibile</p>
				</div>
			{/if}
		{/if}
	</main>

	<!-- Fullscreen Modal -->
	{#if selectedProduct}
		<div 
			class="modal-overlay" 
			role="button"
			tabindex="0"
			transition:fade={{ duration: 200 }} 
			on:click={closeDetail}
			on:keydown={(e) => e.key === 'Escape' && closeDetail()}
		>
			<div 
				class="modal-card" 
				role="document" 
				on:click|stopPropagation
				on:keydown|stopPropagation
			>
				<div class="modal-image-container">
					<img src={selectedProduct.image_url} alt={selectedProduct.name} />
					<button class="modal-close" on:click={closeDetail}>
						<X size={24} />
					</button>
				</div>
				<div class="modal-content">
					<h2>{selectedProduct.name}</h2>
					<p class="modal-desc">{selectedProduct.description}</p>
					{#if selectedProduct.detailed_description}
						<div class="modal-story">
							<p>{selectedProduct.detailed_description}</p>
						</div>
					{/if}
					
					<div class="modal-price-section">
						{#if selectedProduct.pricing.type === 'single'}
							<span class="price-tag">€ {selectedProduct.pricing.value.toFixed(2)}</span>
						{:else}
							<div class="variants-list">
								{#each selectedProduct.pricing.variants as variant}
									<div class="variant-row">
										<span>{variant.name}</span>
										<span class="variant-price">€ {variant.price.toFixed(2)}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Popup Evento -->
	{#if showEventoPopup && eventoCorrente}
		<div 
			class="modal-overlay evento-overlay" 
			role="button"
			tabindex="0"
			transition:fade={{ duration: 300 }} 
			on:click={closeEventoPopup}
			on:keydown={(e) => e.key === 'Escape' && closeEventoPopup()}
		>
			<div 
				class="evento-popup" 
				role="document" 
				on:click|stopPropagation
				on:keydown|stopPropagation
			>
				<button class="evento-close" on:click={closeEventoPopup}>
					<X size={24} />
				</button>
				
				{#if eventoCorrente.immagine_url}
					<div class="evento-image">
						<img 
							src={eventoCorrente.immagine_url} 
							alt={eventoCorrente.titolo}
							loading="eager"
							decoding="async"
						/>
						{#if getBadgeText(eventoCorrente)}
							<div class="evento-badge {getStatoEvento(eventoCorrente)}">
								<Calendar size={16} />
								{getBadgeText(eventoCorrente)}
							</div>
						{/if}
					</div>
				{/if}
				
				<div class="evento-content">
					<h2 class="evento-title">{eventoCorrente.titolo}</h2>
					
					{#if eventoCorrente.sottotitolo}
						<p class="evento-subtitle">{eventoCorrente.sottotitolo}</p>
					{/if}
					
					{#if eventoCorrente.descrizione}
						<p class="evento-desc">{eventoCorrente.descrizione}</p>
					{/if}
					
					<div class="evento-dates">
						<div class="evento-date-item">
							<span class="date-label">Inizio:</span>
							<span class="date-value">
								{formatEventoDate(eventoCorrente.data_inizio)}
							</span>
						</div>
						<div class="evento-date-item">
							<span class="date-label">Fine:</span>
							<span class="date-value">
								{formatEventoDate(eventoCorrente.data_fine)}
							</span>
						</div>
					</div>
					
					<a href="tel:+393517318400" class="prenota-btn">
						<Phone size={20} />
						<span>Prenota ora</span>
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--primary: #154315;
		--surface: #f4f4f4;
		--white: #ffffff;
		--text: #222;
		--text-light: #666;
		scroll-behavior: smooth;
	}
	
	html {
		scroll-behavior: smooth;
	}

	.app-container {
		background: linear-gradient(to bottom, #f0f4f0 0%, #e8ede8 100%);
		min-height: 100vh;
		padding-bottom: 40px;
	}

	/* Top Bar */
	.top-bar {
		background: var(--white);
		padding: 0.8rem 1rem 0.5rem;
		position: sticky;
		top: 0;
		z-index: 50;
		/* Removed shadow to blend with tabs */
	}

	.top-bar-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.logo {
		font-family: 'Playfair Display', serif;
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--primary);
		text-decoration: none;
		letter-spacing: 0.05em;
	}

	.back-link {
		color: var(--text-light);
		padding: 8px;
		border-radius: 50%;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-container {
		display: flex;
		align-items: center;
		background: #f2f2f2;
		border-radius: 12px;
		padding: 0.6rem 1rem;
		transition: all 0.2s;
	}

	.search-container.focused {
		background: #fff;
		box-shadow: 0 0 0 2px var(--primary);
	}

	:global(.search-icon) {
		color: #888;
		margin-right: 0.5rem;
	}

	.search-container input {
		border: none;
		background: transparent;
		font-size: 1rem;
		width: 100%;
		outline: none;
		color: var(--text);
	}

	.clear-search {
		background: none;
		border: none;
		color: #888;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	/* Macro Tabs Container - App Style */
	.macro-tabs-container {
		display: flex;
		background: var(--white);
		border-bottom: 1px solid #eee;
		position: sticky;
		top: 66px; /* Adjust based on header height */
		z-index: 45;
	}

	.macro-tab-btn {
		flex: 1;
		padding: 1rem 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		position: relative;
		text-align: center;
		transition: all 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}
	
	.macro-icon {
		width: 100px;
		height: 100px;
		object-fit: contain;
		opacity: 0.6;
		transition: all 0.2s;
	}
	
	.macro-tab-btn.active .macro-icon {
		opacity: 1;
		transform: scale(1.1);
	}
	
	.macro-tab-text {
		font-family: 'Playfair Display', serif;
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #999;
		transition: color 0.2s;
	}

	.macro-tab-btn.active .macro-tab-text {
		color: var(--primary);
		transform: scale(1.05);
	}

	/* Active Line Indicator */
	.macro-tab-btn::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 3px;
		background: var(--primary);
		transition: width 0.3s ease;
		border-radius: 3px 3px 0 0;
	}

	.macro-tab-btn.active::after {
		width: 60%;
	}
	
	/* Adjust subcat sticky position */
	.subcat-bar {
		top: 120px; /* header + macro height */
	}

	/* Menu Sections */
	.menu-sections {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Category Section (per categorie con sottocategorie) */
	.category-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.category-header {
		padding: 0.5rem 0;
		border-bottom: 2px solid var(--primary);
		margin-bottom: 0.25rem;
	}

	.category-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--primary);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Accordion Container */
	.accordion-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.accordion-item {
		background: var(--white);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		transition: all 0.3s ease;
	}

	.accordion-item:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.1);
	}

	.accordion-header {
		width: 100%;
		padding: 1.1rem 1.3rem;
		background: var(--white);
		border: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		transition: all 0.3s ease;
		gap: 1rem;
	}

	.accordion-header:hover {
		background: #f8f9fa;
	}

	.accordion-header.open {
		background: linear-gradient(135deg, var(--primary) 0%, #1a5a1a 100%);
	}

	.accordion-header.open .accordion-title {
		color: white;
	}

	.accordion-header.open .accordion-subtitle {
		color: rgba(255, 255, 255, 0.9);
	}

	.accordion-header-content {
		flex: 1;
		text-align: left;
	}

	.accordion-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--primary);
		margin: 0;
		transition: color 0.3s ease;
	}

	.accordion-subtitle {
		font-size: 0.85rem;
		color: #777;
		margin: 0.25rem 0 0 0;
		transition: color 0.3s ease;
	}

	:global(.accordion-chevron) {
		color: var(--primary);
		flex-shrink: 0;
	}

	.accordion-header.open :global(.accordion-chevron) {
		color: white;
	}

	.accordion-content {
		background: linear-gradient(to bottom, #f5f9f5 0%, #f0f4f0 100%);
		padding: 1rem;
		border-top: 1px solid rgba(21, 67, 21, 0.08);
	}

	.products-list {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.product-card-compact {
		background: #ffffff;
		border-radius: 14px;
		border: 1px solid rgba(21, 67, 21, 0.08);
		padding: 1.2rem 1.3rem;
		display: flex;
		justify-content: space-between;
		gap: 1.1rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 3px 10px rgba(21, 67, 21, 0.08), 0 1px 3px rgba(0,0,0,0.04);
		min-height: 130px;
		position: relative;
		overflow: hidden;
	}

	/* Card con immagine di sfondo */
	.product-card-compact.has-image {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 180px;
		padding: 1.5rem;
		border: none;
	}

	/* Overlay sfumatura verde */
	.product-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, rgba(21, 67, 21, 0.9) 0%, rgba(21, 67, 21, 0.6) 50%, rgba(21, 67, 21, 0) 100%);
		z-index: 1;
		transition: all 0.3s ease;
	}

	.product-card-compact.has-image:hover .product-overlay {
		background: linear-gradient(to right, rgba(21, 67, 21, 0.85) 0%, rgba(21, 67, 21, 0.5) 60%, rgba(21, 67, 21, 0) 100%);
	}

	/* Contenuto sopra l'overlay */
	.product-card-compact.has-image .product-info {
		position: relative;
		z-index: 2;
	}

	.product-card-compact.has-image .product-name {
		color: #ffffff;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
		font-size: 1.25rem;
	}

	.product-card-compact.has-image .product-desc {
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}

	.product-card-compact.has-image .product-price {
		color: #ffffff;
		font-weight: 700;
		font-size: 1.1rem;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.product-card-compact.has-image .variant-compact {
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 3px rgba(0,0,0,0.3);
	}

	.product-card-compact.has-image .variant-compact strong {
		color: #ffffff;
	}

	.product-card-compact::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: linear-gradient(135deg, rgba(21, 67, 21, 0.02) 0%, rgba(255,255,255,0) 50%);
		pointer-events: none;
		z-index: 0;
	}

	.product-card-compact.has-image::before {
		display: none;
	}

	.product-card-compact:hover {
		transform: translateY(-3px) scale(1.01);
		box-shadow: 0 8px 20px rgba(21, 67, 21, 0.15), 0 3px 8px rgba(0,0,0,0.08);
		background: #ffffff;
		border-color: rgba(21, 67, 21, 0.15);
	}

	.product-card-compact.has-image:hover {
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
	}

	.product-card-compact:hover::after {
		opacity: 1;
		height: 80%;
	}

	.product-card-compact:active {
		transform: scale(0.98);
	}

	/* Unavailable product styles */
	.product-card-compact.unavailable,
	.product-card.unavailable {
		opacity: 0.6;
		cursor: not-allowed;
		position: relative;
	}

	.product-card-compact.unavailable:hover,
	.product-card.unavailable:hover {
		transform: none;
		box-shadow: 0 1px 4px rgba(0,0,0,0.04);
	}

	.product-card-compact.unavailable .product-thumb img,
	.product-card.unavailable .product-thumb img {
		filter: grayscale(70%);
	}

	.unavailable-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: #dc3545;
		color: white;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		z-index: 5;
	}

	/* Variants compact display */
	.variants-compact {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.variant-compact {
		font-size: 0.95rem; /* Aumentato da 0.9rem */
		color: var(--text);
	}

	.variant-compact strong {
		color: var(--primary);
		font-weight: 600;
	}

	.no-products {
		text-align: center;
		color: #999;
		font-style: italic;
		padding: 1rem;
	}

	/* Subcategories Grid */
	.subcategories-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
		padding: 0;
	}

	@media(min-width: 640px) {
		.subcategories-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.subcat-card {
		background: var(--white);
		border: 2px solid #eee;
		border-radius: 16px;
		padding: 2rem 1.5rem;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
		min-height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.5rem;
	}

	.subcat-card:hover {
		border-color: var(--primary);
		transform: translateY(-4px);
		box-shadow: 0 8px 20px rgba(21, 67, 21, 0.15);
	}

	.subcat-card:active {
		transform: translateY(-2px);
	}

	.subcat-card-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--primary);
		margin: 0;
	}

	.subcat-card-desc {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
	}

	/* Back Bar */
	.back-bar {
		background: var(--white);
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.back-btn:hover {
		background: #1a5a1a;
	}

	.back-btn:active {
		transform: scale(0.95);
	}

	.current-subcat {
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--primary);
		margin: 0;
	}

	/* Subcategory Dropdown - Collapsible */
	.subcat-dropdown {
		background: var(--white);
		padding: 1rem;
		border-bottom: 1px solid #eee;
		box-shadow: 0 4px 12px -4px rgba(0,0,0,0.05);
	}

	.subcat-scroll {
		display: flex;
		flex-wrap: wrap; /* Wrap instead of scroll */
		gap: 0.5rem;
		justify-content: center; /* Center them */
	}
	
	.subcat-btn {
		white-space: nowrap;
		padding: 0.5rem 1rem;
		border-radius: 50px; /* Fully rounded pill */
		background: var(--surface); 
		border: 1px solid transparent;
		color: var(--text);
		font-weight: 500;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.subcat-btn:active {
		transform: scale(0.95);
	}

	.subcat-btn.active {
		background: var(--primary);
		color: var(--white);
		border-color: var(--primary);
		box-shadow: 0 4px 10px rgba(21, 67, 21, 0.2);
	}

	/* Content */
	.content-area {
		padding: 1rem;
		background: transparent;
	}

	.products-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media(min-width: 640px) {
		.products-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.macro-card {
			height: 160px;
		}
		
		.macro-title {
			font-size: 1.1rem;
		}
	}

	@media(min-width: 1024px) {
		.products-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Product Card */
	.product-card {
		background: var(--white);
		border-radius: 16px;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
		cursor: pointer;
		transition: transform 0.2s;
		min-height: 110px;
	}

	.product-card:active {
		transform: scale(0.98);
	}

	.product-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
	}

	.product-info > div:first-child {
		flex: 1;
	}

	.product-price {
		margin-top: auto;
		font-weight: 700;
		color: var(--primary);
		font-size: 1.15rem; /* Aumentato da 1.05rem */
		padding-top: 0.3rem;
		align-self: flex-end;
		text-align: right;
	}

	/* Rimuovo il vecchio stile product-thumb visto che ora l'immagine è di sfondo */

	.product-name {
		font-size: 1.25rem; /* Aumentato da 1.15rem */
		font-weight: 700;
		margin-bottom: 0.3rem;
		color: var(--primary);
		font-family: 'Playfair Display', serif;
		line-height: 1.3;
		letter-spacing: 0.01em;
	}

	.product-desc {
		font-size: 0.95rem; /* Aumentato da 0.85rem */
		color: #666;
		margin-bottom: 0.5rem;
		line-height: 1.45;
		max-height: none;
		overflow: visible;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #888;
	}

	.reset-btn {
		margin-top: 1rem;
		padding: 0.5rem 1.5rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 20px;
		cursor: pointer;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.6);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		backdrop-filter: blur(5px);
	}

	.modal-card {
		background: var(--white);
		width: 100%;
		max-width: 450px;
		border-radius: 24px;
		overflow: hidden;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 40px rgba(0,0,0,0.2);
	}

	.modal-image-container {
		height: 250px;
		position: relative;
		flex-shrink: 0;
	}

	.modal-image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 40px;
		height: 40px;
		background: white;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		color: var(--text);
	}

	.modal-content {
		padding: 1.5rem;
		overflow-y: auto;
	}

	.modal-content h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
		color: var(--primary);
	}

	.modal-desc {
		font-size: 1rem;
		color: #555;
		line-height: 1.5;
		margin-bottom: 1.5rem;
	}

	.modal-story {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		font-style: italic;
		color: #666;
		font-size: 0.9rem;
	}

	.modal-price-section {
		border-top: 1px solid #eee;
		padding-top: 1rem;
	}

	.price-tag {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--primary);
	}

	.variants-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.variant-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px dashed #eee;
	}

	.variant-price {
		font-weight: 600;
		color: var(--primary);
	}

	/* Loading state */
	.loading-state {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto 1rem;
		border: 4px solid #f0f4f0;
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	/* Popup Evento */
	.evento-overlay {
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(8px);
	}
	
	.evento-popup {
		background: var(--white);
		width: 100%;
		max-width: 500px;
		border-radius: 24px;
		overflow: hidden;
		max-height: 85vh; /* Ridotto da 90vh per mobile */
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		position: relative;
		animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	
	.evento-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 44px;
		height: 44px;
		background: rgba(255, 255, 255, 0.95);
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		color: var(--text);
		z-index: 10;
		transition: all 0.2s;
	}
	
	.evento-close:hover {
		background: white;
		transform: scale(1.1);
	}
	
	.evento-close:active {
		transform: scale(0.95);
	}
	
	.evento-image {
		height: 280px;
		position: relative;
		flex-shrink: 0;
		overflow: hidden;
	}
	
	.evento-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.evento-badge {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 50px;
		font-weight: 700;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		z-index: 5;
	}
	
	.evento-badge.in_corso {
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
	}
	
	.evento-badge.in_arrivo {
		background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
		color: white;
	}
	
	.evento-content {
		padding: 2rem 1.5rem;
		overflow-y: auto;
	}
	
	.evento-title {
		font-family: 'Playfair Display', serif;
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--primary);
		line-height: 1.2;
	}
	
	.evento-subtitle {
		font-size: 1.1rem;
		font-weight: 600;
		color: #555;
		margin: 0 0 1rem 0;
		line-height: 1.4;
	}
	
	.evento-desc {
		font-size: 1rem;
		color: #666;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
	}
	
	.evento-dates {
		background: linear-gradient(135deg, #f0f4f0 0%, #e8ede8 100%);
		border-radius: 16px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 2px solid rgba(21, 67, 21, 0.1);
	}
	
	.evento-date-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.date-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
		color: var(--primary);
	}
	
	.date-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
	}
	
	.prenota-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		margin-top: 1.5rem;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, var(--primary) 0%, #1a5a1a 100%);
		color: white;
		border: none;
		border-radius: 16px;
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 8px 20px rgba(21, 67, 21, 0.25);
		position: relative;
		overflow: hidden;
	}
	
	.prenota-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
		transition: left 0.5s;
	}
	
	.prenota-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 30px rgba(21, 67, 21, 0.35);
	}
	
	.prenota-btn:hover::before {
		left: 100%;
	}
	
	.prenota-btn:active {
		transform: translateY(0);
		box-shadow: 0 6px 15px rgba(21, 67, 21, 0.25);
	}
	
	@media(max-width: 480px) {
		.evento-popup {
			max-width: 95%;
			margin: 0 1rem;
			max-height: 80vh; /* Ridotto per mobile */
		}
		
		.evento-image {
			height: 200px; /* Ridotto da 280px per mobile */
		}
		
		.evento-title {
			font-size: 1.6rem;
		}
		
		.evento-subtitle {
			font-size: 1rem;
		}
		
		.evento-content {
			padding: 1.5rem 1.25rem;
			overflow-y: auto; /* Aggiungi scroll se necessario */
		}
		
		.prenota-btn {
			font-size: 1rem;
			padding: 0.9rem 1.5rem;
		}
		
		/* Aumenta font delle card prodotti su mobile */
		.product-name {
			font-size: 1.3rem;
		}
		
		.product-desc {
			font-size: 1rem;
		}
		
		.product-price {
			font-size: 1.2rem;
		}
		
		.variant-compact {
			font-size: 1rem;
		}
	}
</style>
