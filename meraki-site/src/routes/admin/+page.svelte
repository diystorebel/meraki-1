<script>
	import { isAuthenticated, login, authLoading } from '$lib/stores/authStore.js';
	import { menuStore, updateMenuItem, addMenuItem, deleteMenuItem, toggleItemAvailability } from '$lib/stores/menuStore.js';
	import { categoriesStore, addCategory, updateCategory, deleteCategory, addSubcategory, removeSubcategory, MACRO_CATEGORIES, moveCategoryOrder, reorderSubcategories } from '$lib/stores/categoriesStore.js';
	import { eventiStore, loadEventi, addEvento, updateEvento, deleteEvento, getStatoEvento, getBadgeText, eventiLoading } from '$lib/stores/eventiStore.js';
	import { galleryStore, loadGallery, addGalleryImage, deleteGalleryImage as deleteGalleryImageFromDb, updateGalleryOrder, updateGalleryAltText, galleryLoading, themesStore, loadThemes, addTheme, updateTheme, deleteTheme, updateImageTheme, galleryByTheme } from '$lib/stores/galleryStore.js';
	import { uploadMenuImage, deleteMenuImage, uploadGalleryImage, deleteGalleryImage } from '$lib/utils/imageUpload.js';
	import { Lock, Package, Tag, Eye, Camera, Plus, Search, X, Edit, Trash2, Check, FileText, DollarSign, ArrowLeft, MousePointerClick, Home, Calendar, Clock, Image as ImageIcon, GripVertical, Palette, FolderOpen, AlertTriangle, Lightbulb, ChevronUp, ChevronDown } from 'lucide-svelte';

	let email = '';
	let password = '';
	let error = '';
	let activeSection = 'home'; // home, products, categories, eventi, gallery
	let editingItem = null;
	let showModal = false;
	let searchFilter = '';
	let categoryFilter = '';
	let availabilityFilter = ''; // 'all', 'available', 'unavailable'

	// Category management
	let showCategoryModal = false;
	let editingCategory = null;
	let categoryFormData = { name: '', macro_category: null };
	let newSubcategory = '';

	// Image handling
	let isUploadingImage = false;
	let uploadError = '';

	// Eventi management
	let showEventoModal = false;
	let editingEvento = null;
	let eventoFormData = {
		titolo: '',
		descrizione: '',
		immagine_url: '',
		data_inizio: '',
		data_fine: '',
		orario: ''
	};
	let isUploadingEventoImage = false;
	let eventoUploadError = '';
	let zoomedImage = null;

	// Gallery management
	let isUploadingGalleryImage = false;
	let galleryUploadError = '';
	let editingGalleryImage = null;
	let showGalleryAltModal = false;
	let galleryAltText = '';
	let draggedItem = null;
	let dragOverItem = null;
	
	// Subcategory drag & drop
	let draggedSubcat = null;
	let dragOverSubcat = null;
	
	// Multi-upload management
	let pendingFiles = []; // Files selezionati in attesa di upload
	let uploadProgress = 0;
	let totalFilesToUpload = 0;
	let isDraggingOver = false;
	
	// Theme management
	let selectedThemeFilter = 'all'; // 'all' o id del tema
	let showThemeModal = false;
	let editingTheme = null;
	let themeFormData = { nome: '', descrizione: '' };
	let selectedUploadTheme = null; // tema selezionato per upload
	let showImageThemeModal = false;
	let editingImageForTheme = null;
	let selectedImageTheme = null;
	let showThemesPanel = false; // Panel temi collassabile

	// Modal System
	let showConfirmModal = false;
	let showErrorModal = false;
	let confirmModalData = {
		title: '',
		message: '',
		hint: '', // Suggerimento opzionale con icona lampadina
		confirmText: 'Conferma',
		cancelText: 'Annulla',
		onConfirm: null,
		onCancel: null,
		type: 'danger' // 'danger', 'warning', 'info'
	};
	let errorModalData = {
		title: 'Errore',
		message: '',
		buttonText: 'OK'
	};

	// Form data
	let formData = {
		name: '',
		category_id: null,
		subcategory: '',
		description: '',
		detailed_description: '',
		pricing: { type: 'single', value: 0 },
		note: '',
		image_url: ''
	};

	function getSubcategoriesForCategoryId(categoryId) {
		const cat = $categoriesStore.find(c => c.id === categoryId);
		return cat ? cat.subcategories : [];
	}

	$: availableSubcategories = formData.category_id 
		? getSubcategoriesForCategoryId(formData.category_id) 
		: [];

	function getCategoryName(categoryId) {
		const cat = $categoriesStore.find(c => c.id === categoryId);
		return cat ? cat.name : '';
	}

	function getProductCountForCategory(categoryId) {
		return $menuStore.filter(item => item.category_id === categoryId).length;
	}

	// Normalizza stringa in Title Case (prima lettera di ogni parola maiuscola)
	function toTitleCase(str) {
		if (!str) return str;
		return str
			.toLowerCase()
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	$: filteredMenu = $menuStore.filter(item => {
		const matchSearch = !searchFilter || 
			item.name.toLowerCase().includes(searchFilter.toLowerCase());
		const matchCategory = !categoryFilter || getCategoryName(item.category_id) === categoryFilter;
		const matchAvailability = !availabilityFilter || 
			(availabilityFilter === 'available' && item.is_available !== false) ||
			(availabilityFilter === 'unavailable' && item.is_available === false);
		return matchSearch && matchCategory && matchAvailability;
	});

	async function handleLogin(e) {
		e.preventDefault();
		error = '';
		
		const result = await login(email, password);
		if (!result.success) {
			error = result.error || 'Errore di login';
			password = '';
		} else {
			// Carica i dati degli store appena l'utente si autentica
			await Promise.all([
				loadEventi(),
				loadThemes(),
				loadGallery()
			]);
		}
	}

	function openAddModal() {
		editingItem = null;
		formData = {
			name: '',
			category_id: $categoriesStore[0]?.id || null,
			subcategory: '',
			description: '',
			detailed_description: '',
			pricing: { type: 'single', value: 0 },
			note: '',
			image_url: ''
		};
		showModal = true;
	}

	// Category management functions
	function openCategoryModal(category = null) {
		editingCategory = category;
		if (category) {
			categoryFormData = { name: category.name, macro_category: category.macro_category || null };
		} else {
			categoryFormData = { name: '', macro_category: null };
		}
		showCategoryModal = true;
	}

	function closeCategoryModal() {
		showCategoryModal = false;
		editingCategory = null;
		newSubcategory = '';
	}

	async function handleSaveCategory() {
		if (editingCategory) {
			await updateCategory(editingCategory.id, categoryFormData);
		} else {
			await addCategory(categoryFormData.name, categoryFormData.macro_category);
		}
		closeCategoryModal();
	}

	async function handleDeleteCategory(id) {
		const category = $categoriesStore.find(c => c.id === id);
		const productCount = getProductCountForCategory(id);
		const categoryName = category ? category.name : 'questa categoria';

		if (productCount > 0) {
			// Categoria con prodotti: mostra warning dettagliato
			showConfirm(
				'Categoria non vuota',
				`La categoria "${categoryName}" contiene ${productCount} prodott${productCount === 1 ? 'o' : 'i'}.\n\nEliminando questa categoria, i prodotti al suo interno non saranno più visibili nel menu pubblico.`,
				() => deleteCategory(id),
				{ 
					type: 'warning', 
					confirmText: 'Elimina comunque',
					hint: 'Se vuoi solo cambiare il nome della categoria, usa "Modifica" invece di eliminarla.'
				}
			);
		} else {
			// Categoria vuota: conferma normale
			showConfirm(
				'Elimina Categoria',
				`Eliminare la categoria "${categoryName}"?`,
				() => deleteCategory(id),
				{ type: 'danger', confirmText: 'Elimina' }
			);
		}
	}

	async function handleAddSubcategory(categoryId) {
		if (newSubcategory.trim()) {
			// Normalizza in Title Case per evitare duplicati
			await addSubcategory(categoryId, toTitleCase(newSubcategory.trim()));
			newSubcategory = '';
		}
	}

	async function handleRemoveSubcategory(categoryId, subcategoryName) {
		showConfirm(
			'Rimuovi Sottocategoria',
			`Rimuovere "${subcategoryName}"?`,
			() => removeSubcategory(categoryId, subcategoryName),
			{ type: 'warning', confirmText: 'Rimuovi' }
		);
	}

	// Move category up/down
	async function handleMoveCategory(categoryId, direction) {
		await moveCategoryOrder(categoryId, direction);
	}

	// Subcategory drag & drop handlers
	function handleSubcatDragStart(subcat) {
		draggedSubcat = subcat;
	}

	function handleSubcatDragOver(e, subcat) {
		e.preventDefault();
		if (draggedSubcat && draggedSubcat !== subcat) {
			dragOverSubcat = subcat;
		}
	}

	function handleSubcatDragLeave() {
		dragOverSubcat = null;
	}

	async function handleSubcatDrop(categoryId, subcategories) {
		if (!draggedSubcat || !dragOverSubcat || draggedSubcat === dragOverSubcat) {
			draggedSubcat = null;
			dragOverSubcat = null;
			return;
		}

		const fromIndex = subcategories.indexOf(draggedSubcat);
		const toIndex = subcategories.indexOf(dragOverSubcat);
		
		if (fromIndex === -1 || toIndex === -1) {
			draggedSubcat = null;
			dragOverSubcat = null;
			return;
		}

		// Reorder array
		const newOrder = [...subcategories];
		newOrder.splice(fromIndex, 1);
		newOrder.splice(toIndex, 0, draggedSubcat);

		await reorderSubcategories(categoryId, newOrder);
		
		draggedSubcat = null;
		dragOverSubcat = null;
	}

	function handleSubcatDragEnd() {
		draggedSubcat = null;
		dragOverSubcat = null;
	}

	function openEditModal(item) {
		editingItem = item;
		formData = {
			name: item.name,
			category_id: item.category_id,
			subcategory: item.subcategory || '',
			description: item.description || '',
			detailed_description: item.detailed_description || '',
			pricing: item.pricing,
			note: item.note || '',
			image_url: item.image_url || ''
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingItem = null;
		uploadError = '';
	}

	async function handleSave() {
		const data = {
			...formData,
			// Normalizza sottocategoria in Title Case per evitare duplicati
			subcategory: toTitleCase(formData.subcategory)
		};

		if (editingItem) {
			await updateMenuItem(editingItem.id, data);
		} else {
			await addMenuItem(data);
		}
		closeModal();
	}

	async function handleDelete(id) {
		showConfirm(
			'Elimina Prodotto',
			'Sei sicuro di voler eliminare questo prodotto?',
			() => deleteMenuItem(id),
			{ type: 'danger', confirmText: 'Elimina' }
		);
	}

	async function handleImageUpload(e) {
		const file = e.target.files[0];
		if (!file) return;

		uploadError = '';
		isUploadingImage = true;

		try {
			const fileName = `${Date.now()}_${file.name}`;
			const result = await uploadMenuImage(file, fileName);

			if (result.error) {
				uploadError = result.error;
			} else {
				formData.image_url = result.url;
			}
		} catch (error) {
			console.error('Upload error:', error);
			uploadError = 'Errore durante il caricamento';
		} finally {
			isUploadingImage = false;
			e.target.value = '';
		}
	}

	async function handleRemoveImage() {
		if (formData.image_url) {
			await deleteMenuImage(formData.image_url);
			formData.image_url = '';
		}
	}

	function addVariant() {
		formData.pricing = {
			type: 'multiple',
			variants: [
				...(formData.pricing.variants || []),
				{ name: '', price: 0 }
			]
		};
	}

	function removeVariant(index) {
		if (formData.pricing.variants) {
			formData.pricing.variants = formData.pricing.variants.filter((_, i) => i !== index);
			if (formData.pricing.variants.length === 0) {
				formData.pricing = { type: 'single', value: 0 };
			}
		}
	}

	function togglePricingType() {
		if (formData.pricing.type === 'single') {
			formData.pricing = {
				type: 'multiple',
				variants: [{ name: '', price: 0 }]
			};
		} else {
			formData.pricing = { type: 'single', value: 0 };
		}
	}

	// Gallery functions - Multi upload
	function handleFilesSelected(e) {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;
		
		// Aggiungi preview per ogni file
		files.forEach(file => {
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (ev) => {
					pendingFiles = [...pendingFiles, {
						file,
						preview: ev.target.result,
						name: file.name,
						id: Date.now() + Math.random()
					}];
				};
				reader.readAsDataURL(file);
			}
		});
		
		e.target.value = '';
	}

	function removePendingFile(id) {
		pendingFiles = pendingFiles.filter(f => f.id !== id);
	}

	function clearPendingFiles() {
		pendingFiles = [];
	}

	async function uploadPendingFiles() {
		if (pendingFiles.length === 0) return;
		
		galleryUploadError = '';
		isUploadingGalleryImage = true;
		totalFilesToUpload = pendingFiles.length;
		uploadProgress = 0;

		const themeId = selectedUploadTheme && selectedUploadTheme !== 'all' ? parseInt(selectedUploadTheme) : null;

		for (let i = 0; i < pendingFiles.length; i++) {
			const { file } = pendingFiles[i];
			
			try {
				const fileName = `gallery_${Date.now()}_${file.name}`;
				const uploadResult = await uploadGalleryImage(file, fileName);

				if (uploadResult.error) {
					galleryUploadError = `Errore su ${file.name}: ${uploadResult.error}`;
				} else {
					const result = await addGalleryImage(uploadResult.url, '', themeId);
					if (!result.success) {
						galleryUploadError = `Errore su ${file.name}: ${result.error}`;
					}
				}
			} catch (error) {
				console.error('Upload error:', error);
				galleryUploadError = `Errore su ${file.name}`;
			}
			
			uploadProgress = i + 1;
		}

		pendingFiles = [];
		isUploadingGalleryImage = false;
		uploadProgress = 0;
		totalFilesToUpload = 0;
	}

	// Drag & drop zone
	function handleDragEnter(e) {
		e.preventDefault();
		isDraggingOver = true;
	}

	function handleDragLeave(e) {
		e.preventDefault();
		isDraggingOver = false;
	}

	function handleDropFiles(e) {
		e.preventDefault();
		isDraggingOver = false;
		
		const files = Array.from(e.dataTransfer.files || []);
		files.forEach(file => {
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (ev) => {
					pendingFiles = [...pendingFiles, {
						file,
						preview: ev.target.result,
						name: file.name,
						id: Date.now() + Math.random()
					}];
				};
				reader.readAsDataURL(file);
			}
		});
	}

	async function handleDeleteGalleryImage(image) {
		showConfirm(
			'Elimina Immagine',
			'Eliminare questa immagine dalla gallery?',
			async () => {
				try {
					// Delete from storage
					await deleteGalleryImage(image.immagine_url);
					// Delete from database
					await deleteGalleryImageFromDb(image.id);
				} catch (error) {
					console.error('Delete error:', error);
					showError('Errore durante l\'eliminazione dell\'immagine');
				}
			},
			{ type: 'danger', confirmText: 'Elimina' }
		);
	}

	function openAltTextModal(image) {
		editingGalleryImage = image;
		galleryAltText = image.alt_text || '';
		showGalleryAltModal = true;
	}

	async function saveAltText() {
		if (editingGalleryImage) {
			await updateGalleryAltText(editingGalleryImage.id, galleryAltText);
			showGalleryAltModal = false;
			editingGalleryImage = null;
		}
	}

	// Theme management functions
	function openThemeModal(theme = null) {
		editingTheme = theme;
		if (theme) {
			themeFormData = { nome: theme.nome, descrizione: theme.descrizione || '' };
		} else {
			themeFormData = { nome: '', descrizione: '' };
		}
		showThemeModal = true;
	}

	async function saveTheme() {
		if (!themeFormData.nome.trim()) return;
		
		if (editingTheme) {
			await updateTheme(editingTheme.id, themeFormData);
		} else {
			await addTheme(themeFormData.nome, themeFormData.descrizione);
		}
		showThemeModal = false;
		editingTheme = null;
	}

	async function handleDeleteTheme(theme) {
		showConfirm(
			'Elimina Tema',
			`Sei sicuro di voler eliminare "${theme.nome}"? Le foto rimarranno nella gallery senza tema.`,
			async () => {
				await deleteTheme(theme.id);
			},
			{ type: 'danger', confirmText: 'Elimina' }
		);
	}

	function openImageThemeModal(image) {
		editingImageForTheme = image;
		selectedImageTheme = image.theme_id || '';
		showImageThemeModal = true;
	}

	async function saveImageTheme() {
		if (editingImageForTheme) {
			const themeId = selectedImageTheme ? parseInt(selectedImageTheme) : null;
			await updateImageTheme(editingImageForTheme.id, themeId);
			showImageThemeModal = false;
			editingImageForTheme = null;
		}
	}

	// Filtra immagini per tema selezionato
	$: filteredGalleryImages = selectedThemeFilter === 'all' 
		? $galleryStore 
		: $galleryStore.filter(img => {
			if (selectedThemeFilter === 'uncategorized') {
				return !img.theme_id;
			}
			return img.theme_id === parseInt(selectedThemeFilter);
		});

	// Drag and drop handlers
	function handleDragStart(e, item) {
		draggedItem = item;
		e.dataTransfer.effectAllowed = 'move';
	}

	function handleDragOver(e, item) {
		e.preventDefault();
		dragOverItem = item;
	}

	function handleDragEnd() {
		dragOverItem = null;
	}

	async function handleDrop(e, targetItem) {
		e.preventDefault();
		
		if (!draggedItem || draggedItem.id === targetItem.id) {
			draggedItem = null;
			return;
		}

		const items = [...$galleryStore];
		const draggedIndex = items.findIndex(item => item.id === draggedItem.id);
		const targetIndex = items.findIndex(item => item.id === targetItem.id);

		// Rimuovi l'elemento dalla posizione originale
		const [removed] = items.splice(draggedIndex, 1);
		// Inseriscilo nella nuova posizione
		items.splice(targetIndex, 0, removed);

		// Aggiorna l'ordine nel database
		await updateGalleryOrder(items);
		
		draggedItem = null;
		dragOverItem = null;
	}

	// Modal System Functions
	function showConfirm(title, message, onConfirm, options = {}) {
		confirmModalData = {
			title,
			message,
			hint: options.hint || '',
			confirmText: options.confirmText || 'Conferma',
			cancelText: options.cancelText || 'Annulla',
			type: options.type || 'danger',
			onConfirm: () => {
				showConfirmModal = false;
				if (onConfirm) onConfirm();
			},
			onCancel: () => {
				showConfirmModal = false;
				if (options.onCancel) options.onCancel();
			}
		};
		showConfirmModal = true;
	}

	function showError(message, title = 'Errore') {
		errorModalData = {
			title,
			message,
			buttonText: 'OK'
		};
		showErrorModal = true;
	}

</script>

{#if $authLoading}
	<div class="loading-page">
		<p>Caricamento...</p>
	</div>
{:else if !$isAuthenticated}
	<div class="login-page">
		<div class="login-box">
			<div class="login-header">
				<Lock size={48} color="var(--verde-meraki)" />
				<h1>Admin Meraki</h1>
			</div>
			<form on:submit={handleLogin}>
				<input 
					type="email" 
					bind:value={email}
					placeholder="Email"
					class="login-input"
					required
				/>
				<input 
					type="password" 
					bind:value={password}
					placeholder="Password"
					class="login-input"
					required
				/>
				{#if error}
					<p class="error">{error}</p>
				{/if}
				<button type="submit" class="login-btn">Accedi</button>
			</form>
		</div>
	</div>
{:else}
	<div class="admin-page">
		<!-- Header -->
		<header class="admin-header">
			<div class="header-content">
				<a href="/" class="home-button">
					<Home size={20} />
					Home
				</a>
				<h1>Dashboard Admin</h1>
			</div>
		</header>

		<!-- Home Section -->
		{#if activeSection === 'home'}
			<div class="content">
				<div class="home-grid">
					<div class="nav-card" on:click={() => activeSection = 'products'}>
						<div class="nav-icon">
							<Package size={64} strokeWidth={1.5} />
						</div>
						<h3>Gestisci Prodotti</h3>
						<p>Aggiungi, modifica ed elimina prodotti del menu</p>
						<div class="nav-stats">
							<span>{$menuStore.length} prodotti</span>
						</div>
					</div>
					<div class="nav-card" on:click={() => activeSection = 'categories'}>
						<div class="nav-icon">
							<Tag size={64} strokeWidth={1.5} />
						</div>
						<h3>Gestisci Categorie</h3>
						<p>Organizza categorie e sottocategorie del menu</p>
						<div class="nav-stats">
							<span>{$categoriesStore.length} categorie</span>
						</div>
					</div>
					<div class="nav-card" on:click={async () => { 
						activeSection = 'eventi'; 
						await loadEventi(); 
					}}>
						<div class="nav-icon">
							<Calendar size={64} strokeWidth={1.5} />
						</div>
						<h3>Gestisci Eventi</h3>
						<p>Crea e gestisci eventi con badge NEWS</p>
						<div class="nav-stats">
							<span>{$eventiLoading ? 'Caricamento...' : `${$eventiStore.length} eventi`}</span>
						</div>
					</div>
					<div class="nav-card" on:click={async () => { 
						activeSection = 'gallery'; 
						await loadGallery(); 
					}}>
						<div class="nav-icon">
							<ImageIcon size={64} strokeWidth={1.5} />
						</div>
						<h3>Gestisci Gallery</h3>
						<p>Carica e organizza le immagini della gallery</p>
						<div class="nav-stats">
							<span>{$galleryLoading ? 'Caricamento...' : `${$galleryStore.length} immagini`}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Products Section -->
		{#if activeSection === 'products'}
			<div class="content">
				<button class="btn-back" on:click={() => activeSection = 'home'}>
					<ArrowLeft size={20} />
					Torna alla Home
				</button>

				<!-- Toolbar -->
				<div class="toolbar">
					<button class="btn-primary" on:click={openAddModal}>
						<Plus size={20} />
						Aggiungi Prodotto
					</button>
					<div class="search-wrapper">
						<div class="search-icon-wrapper">
							<Search size={20} />
						</div>
						<input 
							type="text" 
							placeholder="Cerca per nome..." 
							bind:value={searchFilter}
							class="search-input"
						/>
						{#if searchFilter}
							<button class="clear-search" on:click={() => searchFilter = ''}>
								<X size={16} />
							</button>
						{/if}
					</div>
					<select bind:value={categoryFilter} class="filter-select">
						<option value="">Tutte le categorie</option>
						{#each $categoriesStore as cat}
							<option value={cat.name}>{cat.name}</option>
						{/each}
					</select>
					<select bind:value={availabilityFilter} class="filter-select">
						<option value="">Tutti i prodotti</option>
						<option value="available">Disponibili</option>
						<option value="unavailable">Non disponibili</option>
					</select>
				</div>

				<!-- Products Grid -->
				<div class="products-grid">
					{#each filteredMenu as item (item.id)}
						<div class="product-card" class:unavailable={item.is_available === false}>
							{#if item.image_url}
								<div class="product-image">
									<img src={item.image_url} alt={item.name} />
									<div class="image-overlay">
										<span class="overlay-badge">Con Foto</span>
									</div>
								</div>
							{/if}
							
							<div class="product-card-body">
								<div class="product-badges">
									<span class="category-badge">{getCategoryName(item.category_id)}</span>
									{#if item.image_url}
										<span class="click-badge">
											<MousePointerClick size={14} />
											Con Click
										</span>
									{/if}
									{#if item.is_available === false}
										<span class="unavailable-badge">
											<X size={14} />
											Non Disponibile
										</span>
									{/if}
								</div>
								
								<h3 class="product-name">{item.name}</h3>
								
								{#if item.subcategory}
									<p class="product-subcategory">{item.subcategory}</p>
								{/if}
								
								<p class="product-desc-preview">
									{item.description ? item.description.substring(0, 80) + (item.description.length > 80 ? '...' : '') : 'Nessuna descrizione'}
								</p>
								
								<div class="product-price-row">
									{#if item.pricing.type === 'multiple'}
										<div class="price-info">
											<span class="price-label">{item.pricing.variants.length} varianti</span>
											<span class="price-range">
												€{Math.min(...item.pricing.variants.map(v => v.price)).toFixed(2)} - 
												€{Math.max(...item.pricing.variants.map(v => v.price)).toFixed(2)}
											</span>
										</div>
									{:else}
										<div class="price-info">
											<span class="price-single">€{item.pricing.value.toFixed(2)}</span>
										</div>
									{/if}
								</div>
								
								<div class="product-actions">
									<button 
										class="btn-availability" 
										class:available={item.is_available !== false}
										class:unavailable={item.is_available === false}
										on:click={() => toggleItemAvailability(item.id, item.is_available === false)}
										title={item.is_available !== false ? 'Segna come non disponibile' : 'Segna come disponibile'}
									>
										{#if item.is_available !== false}
											<Check size={16} />
										{:else}
											<X size={16} />
										{/if}
									</button>
									<button class="btn-card btn-edit" on:click={() => openEditModal(item)}>
										<Edit size={16} />
										Modifica
									</button>
									<button class="btn-card btn-delete-icon" on:click={() => handleDelete(item.id)}>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>

				{#if filteredMenu.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<Search size={64} strokeWidth={1.5} />
						</div>
						<h3>Nessun prodotto trovato</h3>
						<p>Prova a modificare i filtri di ricerca</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Categories Section -->
		{#if activeSection === 'categories'}
			<div class="content">
				<button class="btn-back" on:click={() => activeSection = 'home'}>
					<ArrowLeft size={20} />
					Torna alla Home
				</button>

				<div class="toolbar">
					<button class="btn-primary" on:click={() => openCategoryModal(null)}>
						<Plus size={20} />
						Aggiungi Categoria
					</button>
				</div>

				<div class="categories-list">
					{#each $categoriesStore as category, index (category.id)}
						<div class="category-item">
							<div class="category-header">
								<!-- Frecce ordine -->
								<div class="category-order-arrows">
									<button 
										class="btn-arrow" 
										on:click={() => handleMoveCategory(category.id, 'up')}
										disabled={index === 0}
										title="Sposta su"
									>
										<ChevronUp size={18} />
									</button>
									<button 
										class="btn-arrow" 
										on:click={() => handleMoveCategory(category.id, 'down')}
										disabled={index === $categoriesStore.length - 1}
										title="Sposta giù"
									>
										<ChevronDown size={18} />
									</button>
								</div>
								
								<div class="category-info">
									<h3>{category.name}</h3>
									<span class="subcategories-count">
										{category.subcategories.length} sottocategorie
									</span>
								</div>
								<div class="category-actions">
									<button class="btn-sm-icon btn-edit" on:click={() => openCategoryModal(category)}>
										<Edit size={16} />
									</button>
									<button class="btn-sm-icon btn-delete" on:click={() => handleDeleteCategory(category.id)}>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
							
							{#if category.subcategories.length > 0}
								<div class="subcategories-list-draggable">
									<span class="drag-hint">Trascina per riordinare</span>
									{#each category.subcategories as subcat}
										<div 
											class="subcategory-tag-draggable"
											class:dragging={draggedSubcat === subcat}
											class:drag-over={dragOverSubcat === subcat}
											draggable="true"
											on:dragstart={() => handleSubcatDragStart(subcat)}
											on:dragover={(e) => handleSubcatDragOver(e, subcat)}
											on:dragleave={handleSubcatDragLeave}
											on:drop={() => handleSubcatDrop(category.id, category.subcategories)}
											on:dragend={handleSubcatDragEnd}
											role="listitem"
										>
											<GripVertical size={14} class="drag-handle" />
											<span>{subcat}</span>
											<button class="remove-subcat" on:click={() => handleRemoveSubcategory(category.id, subcat)}>
												<X size={14} />
											</button>
										</div>
									{/each}
								</div>
							{/if}

							<div class="add-subcategory">
								<input 
									type="text" 
									placeholder="Nuova sottocategoria..." 
									bind:value={newSubcategory}
									on:keypress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
									class="input-subcategory"
								/>
								<button class="btn-add-subcat" on:click={() => handleAddSubcategory(category.id)}>
									<Plus size={16} />
									Aggiungi
								</button>
							</div>
						</div>
					{/each}
				</div>

				{#if $categoriesStore.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<Tag size={64} strokeWidth={1.5} />
						</div>
						<h3>Nessuna categoria</h3>
						<p>Inizia aggiungendo la tua prima categoria</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Eventi Section -->
		{#if activeSection === 'eventi'}
			<div class="content">
				<button class="btn-back" on:click={() => activeSection = 'home'}>
					<ArrowLeft size={20} />
					Torna alla Home
				</button>

				<div class="toolbar">
					<button class="btn-primary" on:click={() => {
						editingEvento = null;
						eventoFormData = {
							titolo: '',
							descrizione: '',
							immagine_url: '',
							data_inizio: '',
							data_fine: '',
							orario: ''
						};
						showEventoModal = true;
					}}>
						<Plus size={20} />
						Aggiungi Evento
					</button>
				</div>

				<div class="eventi-list">
					{#each $eventiStore as evento (evento.id)}
						{@const stato = getStatoEvento(evento)}
						{@const badgeText = getBadgeText(evento)}
						<div class="evento-item" class:active={stato === 'in_corso'} class:upcoming={stato === 'in_arrivo'}>
							<div class="evento-preview" class:clickable={evento.immagine_url} on:click={() => evento.immagine_url && (zoomedImage = evento.immagine_url)} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && evento.immagine_url && (zoomedImage = evento.immagine_url)}>
								{#if evento.immagine_url}
									<img src={evento.immagine_url} alt={evento.titolo} />
									<div class="zoom-hint-admin">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
											<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
										</svg>
									</div>
								{:else}
									<div class="no-image">
										<Calendar size={48} />
									</div>
								{/if}
								{#if badgeText}
									<div class="stato-badge-admin" class:in-corso={stato === 'in_corso'} class:in-arrivo={stato === 'in_arrivo'}>{badgeText}</div>
								{/if}
							</div>
							<div class="evento-details">
								<h3>{evento.titolo}</h3>
								<div class="evento-dates">
									<Calendar size={16} />
									<span>Dal {new Date(evento.data_inizio).toLocaleDateString('it-IT')} 
									al {new Date(evento.data_fine).toLocaleDateString('it-IT')}</span>
								</div>
								{#if evento.orario}
									<div class="evento-orario">
										<Clock size={16} />
										<span>{evento.orario}</span>
									</div>
								{/if}
								<p class="evento-desc">{evento.descrizione}</p>
							</div>
							<div class="evento-actions">
								<button class="btn-sm-icon btn-edit" on:click={() => {
									editingEvento = evento;
									eventoFormData = {
										titolo: evento.titolo,
										descrizione: evento.descrizione,
										immagine_url: evento.immagine_url || '',
										data_inizio: new Date(evento.data_inizio).toISOString().slice(0, 10),
										data_fine: new Date(evento.data_fine).toISOString().slice(0, 10),
										orario: evento.orario || ''
									};
									showEventoModal = true;
								}}>
									<Edit size={16} />
								</button>
								<button class="btn-sm-icon btn-delete" on:click={() => {
									showConfirm(
										'Elimina Evento',
										'Eliminare questo evento?',
										() => deleteEvento(evento.id),
										{ type: 'danger', confirmText: 'Elimina' }
									);
								}}>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					{/each}
				</div>

				{#if $eventiStore.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<Calendar size={64} strokeWidth={1.5} />
						</div>
						<h3>Nessun evento</h3>
						<p>Inizia aggiungendo il tuo primo evento</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Evento Modal -->
		{#if showEventoModal}
			<div class="modal-overlay" on:click={() => showEventoModal = false}>
				<div class="modal-modern" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								<Calendar size={28} class="inline-icon" />
								{editingEvento ? 'Modifica Evento' : 'Nuovo Evento'}
							</h2>
							<p class="modal-subtitle">Badge "NEWS" appare automaticamente quando l'evento è attivo</p>
						</div>
						<button class="close-btn-modern" on:click={() => showEventoModal = false}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-modern">
						<div class="form-section">
							<div class="form-group-modern">
								<label>Titolo Evento *</label>
								<input type="text" bind:value={eventoFormData.titolo} placeholder="es: Live Music Night" required class="input-modern" />
							</div>

							<div class="form-group-modern">
								<label>Descrizione *</label>
								<textarea bind:value={eventoFormData.descrizione} rows="3" placeholder="Descrizione dell'evento..." class="textarea-modern" required></textarea>
							</div>

							<div class="form-row-modern">
								<div class="form-group-modern">
									<label>Data Inizio (Pubblicazione) *</label>
									<input type="date" bind:value={eventoFormData.data_inizio} required class="input-modern" />
									<span class="help-text">Badge NEWS appare da questa data</span>
								</div>

								<div class="form-group-modern">
									<label>Data Fine *</label>
									<input type="date" bind:value={eventoFormData.data_fine} required class="input-modern" />
									<span class="help-text">Badge NEWS scompare dopo questa data</span>
								</div>
							</div>

							<div class="form-group-modern">
								<label>Orario Evento (opzionale)</label>
								<input type="text" bind:value={eventoFormData.orario} placeholder="es: 21:00 - 02:00" class="input-modern" />
								<span class="help-text">Orario visualizzato sulla card evento</span>
							</div>

							<div class="form-group-modern">
								<label>Foto Evento</label>
								{#if eventoFormData.immagine_url}
									<div class="image-preview-modern">
										<img src={eventoFormData.immagine_url} alt="Preview" />
										<div class="image-overlay-preview">
											<button type="button" class="btn-remove-image" on:click={() => {
												eventoFormData.immagine_url = '';
											}} disabled={isUploadingEventoImage}>
												<Trash2 size={20} />
												Rimuovi
											</button>
										</div>
									</div>
								{:else}
									<div class="upload-area">
										<label class="upload-label" class:disabled={isUploadingEventoImage}>
											{#if isUploadingEventoImage}
												<div class="spinner"></div>
												<span>Caricamento...</span>
											{:else}
												<Camera size={48} strokeWidth={1.5} />
												<span>Clicca per caricare foto</span>
												<span class="upload-hint">PNG, JPG fino a 5MB</span>
											{/if}
											<input type="file" accept="image/*,.heic,.heif" on:change={async (e) => {
												const file = e.target.files?.[0];
												if (!file) return;

												isUploadingEventoImage = true;
												eventoUploadError = '';

												try {
													// Se esiste già un'immagine, eliminala prima di caricare la nuova
													if (eventoFormData.immagine_url) {
														await deleteMenuImage(eventoFormData.immagine_url);
													}

													const fileName = `evento_${Date.now()}_${file.name}`;
													const result = await uploadMenuImage(file, fileName);
													if (result.error) {
														eventoUploadError = result.error;
													} else {
														eventoFormData.immagine_url = result.url;
													}
												} catch (error) {
													eventoUploadError = error.message;
												} finally {
													isUploadingEventoImage = false;
													e.target.value = '';
												}
											}} hidden disabled={isUploadingEventoImage} />
										</label>
									</div>
								{/if}
								{#if eventoUploadError}
									<p class="error-message">{eventoUploadError}</p>
								{/if}
							</div>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" type="button" on:click={() => {
							showEventoModal = false;
							eventoUploadError = '';
						}}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={async () => {
							if (!eventoFormData.titolo || !eventoFormData.descrizione || !eventoFormData.data_inizio || !eventoFormData.data_fine) {
								showError('Compila tutti i campi obbligatori', 'Campi Mancanti');
								return;
							}

							// Parse dates and set times: start at 00:00, end at 23:59:59
							const dataInizio = new Date(eventoFormData.data_inizio);
							dataInizio.setHours(0, 0, 0, 0);
							
							const dataFine = new Date(eventoFormData.data_fine);
							dataFine.setHours(23, 59, 59, 999);

							const eventoData = {
								titolo: eventoFormData.titolo,
								descrizione: eventoFormData.descrizione,
								immagine_url: eventoFormData.immagine_url || null,
								data_inizio: dataInizio.toISOString(),
								data_fine: dataFine.toISOString(),
								orario: eventoFormData.orario || null
							};

							if (editingEvento) {
								await updateEvento(editingEvento.id, eventoData);
							} else {
								await addEvento(eventoData);
							}
							showEventoModal = false;
							eventoUploadError = '';
						}} disabled={isUploadingEventoImage}>
							<Check size={20} />
							{editingEvento ? 'Salva Modifiche' : 'Aggiungi Evento'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Product Modal -->
		{#if showModal}
			<div class="modal-overlay" on:click={closeModal}>
				<div class="modal-modern" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								{#if editingItem}
									<Edit size={28} class="inline-icon" />
								{:else}
									<Plus size={28} class="inline-icon" />
								{/if}
								{editingItem ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
							</h2>
							<p class="modal-subtitle">Compila i campi per {editingItem ? 'modificare' : 'aggiungere'} il prodotto</p>
						</div>
						<button class="close-btn-modern" on:click={closeModal}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-modern">
						<!-- Sezione Base -->
						<div class="form-section">
							<h3 class="section-title">
								<FileText size={24} />
								Informazioni Base
							</h3>
							
							<div class="form-group-modern">
								<label>Nome Prodotto *</label>
								<input type="text" bind:value={formData.name} placeholder="es: Mojito, Negroni..." required class="input-modern" />
							</div>

							<div class="form-row-modern">
								<div class="form-group-modern">
									<label>Categoria *</label>
									<select bind:value={formData.category_id} class="select-modern" required>
										<option value={null}>Seleziona categoria</option>
										{#each $categoriesStore as cat}
											<option value={cat.id}>{cat.name}</option>
										{/each}
									</select>
								</div>

								<div class="form-group-modern">
									<label>Sottocategoria</label>
									<select bind:value={formData.subcategory} class="select-modern" disabled={!formData.category_id}>
										<option value="">Nessuna</option>
										{#each availableSubcategories as subcat}
											<option value={subcat}>{subcat}</option>
										{/each}
									</select>
								</div>
							</div>

							<div class="form-group-modern">
								<label>Descrizione Breve</label>
								<textarea bind:value={formData.description} rows="2" placeholder="Descrizione breve visibile sempre sulla card..." class="textarea-modern"></textarea>
								<span class="help-text">Visibile sempre nel menu principale</span>
							</div>
						</div>

						<!-- Sezione Prodotto con Click -->
						<div class="form-section">
							<h3 class="section-title">
								<Eye size={24} />
								Prodotto con Click (Opzionale)
							</h3>
							
							<div class="toggle-card" class:active={formData.image_url}>
								<div class="toggle-content">
									<div class="toggle-info">
										<strong>Abilita Modal Dettagliato</strong>
										<p>Aggiungi foto e descrizione extra - il prodotto sarà cliccabile nel menu</p>
									</div>
								</div>
							</div>

							{#if formData.image_url}
								<div class="detail-section-modern">
									<div class="form-group-modern">
										<label>Foto Prodotto *</label>
										<div class="upload-area">
											<div class="image-preview-modern">
												<img src={formData.image_url} alt="Preview" />
												<div class="image-overlay-preview">
													<button type="button" class="btn-remove-image" on:click={handleRemoveImage} disabled={isUploadingImage}>
														<Trash2 size={20} />
														Rimuovi
													</button>
												</div>
											</div>
										</div>
										{#if uploadError}
											<p class="error-message">{uploadError}</p>
										{/if}
									</div>

									<div class="form-group-modern">
										<label>Descrizione Dettagliata *</label>
										<textarea bind:value={formData.detailed_description} rows="4" placeholder="Descrizione completa mostrata quando l'utente clicca sul prodotto..." class="textarea-modern"></textarea>
										<span class="help-text">Questa descrizione appare SOLO nel modal, non nella card principale</span>
									</div>
								</div>
							{:else}
								<div class="upload-area" style="margin-top: 1rem;">
									<label class="upload-label" class:disabled={isUploadingImage}>
										{#if isUploadingImage}
											<div class="spinner"></div>
											<span>Caricamento...</span>
										{:else}
											<Camera size={48} strokeWidth={1.5} />
											<span>Clicca per caricare foto</span>
											<span class="upload-hint">PNG, JPG fino a 5MB - Abilita modal con click</span>
										{/if}
										<input type="file" accept="image/*,.heic,.heif" on:change={handleImageUpload} hidden disabled={isUploadingImage} />
									</label>
								</div>
								{#if uploadError}
									<p class="error-message">{uploadError}</p>
								{/if}
							{/if}
						</div>

						<!-- Sezione Prezzi -->
						<div class="form-section">
							<h3 class="section-title">
								<DollarSign size={24} />
								Prezzi
							</h3>

							<div class="pricing-toggle">
								<button type="button" class="toggle-btn" class:active={formData.pricing.type === 'single'} on:click={() => formData.pricing.type === 'multiple' && togglePricingType()}>
									Prezzo Singolo
								</button>
								<button type="button" class="toggle-btn" class:active={formData.pricing.type === 'multiple'} on:click={() => formData.pricing.type === 'single' && togglePricingType()}>
									Varianti
								</button>
							</div>

							{#if formData.pricing.type === 'single'}
								<div class="form-group-modern">
									<label>Prezzo</label>
									<div class="price-input-wrapper">
										<span class="currency">€</span>
										<input type="number" step="0.01" bind:value={formData.pricing.value} placeholder="0.00" class="input-modern price-input" />
									</div>
								</div>
							{:else}
								<div class="variants-list">
									{#each formData.pricing.variants as variant, i}
										<div class="variant-item">
											<div class="variant-number">{i + 1}</div>
											<input type="text" bind:value={variant.name} placeholder="Nome (es: Piccola)" class="input-modern" />
											<div class="price-input-wrapper">
												<span class="currency">€</span>
												<input type="number" step="0.01" bind:value={variant.price} placeholder="0.00" class="input-modern price-input" />
											</div>
											<button type="button" class="btn-remove-variant" on:click={() => removeVariant(i)}>
												<X size={16} />
											</button>
										</div>
									{/each}
									<button type="button" class="btn-add-variant" on:click={addVariant}>
										<Plus size={16} />
										Aggiungi Variante
									</button>
								</div>
							{/if}

							<div class="form-group-modern">
								<label>Note</label>
								<input type="text" bind:value={formData.note} placeholder="es: Opzione senza glutine +2€" class="input-modern" />
							</div>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" on:click={closeModal}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={handleSave}>
							<Check size={20} />
							{editingItem ? 'Salva Modifiche' : 'Crea Prodotto'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Category Modal -->
		{#if showCategoryModal}
			<div class="modal-overlay" on:click={closeCategoryModal}>
				<div class="modal-category" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								{#if editingCategory}
									<Edit size={28} class="inline-icon" />
								{:else}
									<Plus size={28} class="inline-icon" />
								{/if}
								{editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
							</h2>
						</div>
						<button class="close-btn-modern" on:click={closeCategoryModal}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-category">
						<div class="form-group-modern">
							<label>Nome Categoria *</label>
							<input type="text" bind:value={categoryFormData.name} placeholder="es: Cocktails, Food..." required class="input-modern" />
						</div>
						
						<div class="form-group-modern">
							<label>Sezione Menu *</label>
							<div class="macro-category-selector">
								{#each MACRO_CATEGORIES as macro}
									<button 
										type="button"
										class="macro-option" 
										class:selected={categoryFormData.macro_category === macro.id}
										on:click={() => categoryFormData.macro_category = macro.id}
									>
										<img src={macro.icon} alt={macro.name} class="macro-option-icon" />
										<span>{macro.name}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" on:click={closeCategoryModal}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={handleSaveCategory} disabled={!categoryFormData.name.trim() || !categoryFormData.macro_category}>
							<Check size={20} />
							{editingCategory ? 'Salva' : 'Crea'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Gallery Section -->
		{#if activeSection === 'gallery'}
			<div class="content">
				<button class="btn-back" on:click={() => activeSection = 'home'}>
					<ArrowLeft size={20} />
					Torna alla Home
				</button>

				<!-- Header compatto con stats -->
				<div class="gallery-header-bar">
					<div class="gallery-stats">
						<span class="stat-item">
							<ImageIcon size={16} />
							{$galleryStore.length} foto
						</span>
						<span class="stat-item">
							<Palette size={16} />
							{$themesStore.length} temi
						</span>
					</div>
					<button class="btn-manage-themes" on:click={() => showThemesPanel = !showThemesPanel}>
						<Palette size={16} />
						{showThemesPanel ? 'Chiudi' : 'Gestisci'} Temi
					</button>
				</div>

				<!-- Themes Management Panel (collapsible) -->
				{#if showThemesPanel}
					<div class="themes-panel">
						<div class="themes-panel-header">
							<h4>Gestione Temi</h4>
							<button class="btn-add-theme-sm" on:click={() => openThemeModal()}>
								<Plus size={14} />
								Nuovo
							</button>
						</div>
						<div class="themes-grid">
							{#each $themesStore as theme (theme.id)}
								<div class="theme-card">
									<div class="theme-card-info">
										<span class="theme-name">{theme.nome}</span>
										<span class="theme-photo-count">{$galleryStore.filter(img => img.theme_id === theme.id).length} foto</span>
									</div>
									<div class="theme-card-actions">
										<button class="btn-icon-xs" on:click={() => openThemeModal(theme)} title="Modifica">
											<Edit size={14} />
										</button>
										<button class="btn-icon-xs danger" on:click={() => handleDeleteTheme(theme)} title="Elimina">
											<Trash2 size={14} />
										</button>
									</div>
								</div>
							{/each}
							{#if $themesStore.length === 0}
								<p class="no-themes">Nessun tema creato</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Filter Tabs - Horizontal Scrollable -->
				<div class="gallery-filters-wrapper">
					<div class="gallery-filters">
						<button 
							class="filter-chip" 
							class:active={selectedThemeFilter === 'all'}
							on:click={() => selectedThemeFilter = 'all'}
						>
							Tutte
							<span class="chip-count">{$galleryStore.length}</span>
						</button>
						{#each $themesStore as theme (theme.id)}
							<button 
								class="filter-chip" 
								class:active={selectedThemeFilter === theme.id.toString()}
								on:click={() => selectedThemeFilter = theme.id.toString()}
							>
								{theme.nome}
								<span class="chip-count">{$galleryStore.filter(img => img.theme_id === theme.id).length}</span>
							</button>
						{/each}
						<button 
							class="filter-chip" 
							class:active={selectedThemeFilter === 'uncategorized'}
							on:click={() => selectedThemeFilter = 'uncategorized'}
						>
							Senza tema
							<span class="chip-count">{$galleryStore.filter(img => !img.theme_id).length}</span>
						</button>
					</div>
				</div>

				<!-- Upload Area - Redesigned -->
				<div 
					class="upload-zone" 
					class:dragging={isDraggingOver}
					class:has-files={pendingFiles.length > 0}
					on:dragenter={handleDragEnter}
					on:dragleave={handleDragLeave}
					on:dragover={(e) => e.preventDefault()}
					on:drop={handleDropFiles}
					role="region"
				>
					{#if pendingFiles.length === 0}
						<!-- Empty state - drop zone -->
						<div class="upload-empty">
							<label class="upload-trigger">
								<div class="upload-icon">
									<Camera size={32} />
								</div>
								<span class="upload-text">Trascina le foto qui o <strong>clicca per selezionare</strong></span>
								<span class="upload-hint">PNG, JPG, HEIC (iPhone) • Max 5MB • Upload multiplo</span>
								<input 
									type="file" 
									accept="image/*,.heic,.heif" 
									multiple
									on:change={handleFilesSelected} 
									hidden 
									disabled={isUploadingGalleryImage} 
								/>
							</label>
						</div>
					{:else}
						<!-- Files selected - preview grid -->
						<div class="upload-preview-section">
							<div class="preview-header">
								<span class="preview-count">{pendingFiles.length} foto selezionate</span>
								<div class="preview-actions">
									<label class="btn-add-more">
										<Plus size={14} />
										Aggiungi altre
										<input 
											type="file" 
											accept="image/*,.heic,.heif" 
											multiple
											on:change={handleFilesSelected} 
											hidden 
											disabled={isUploadingGalleryImage} 
										/>
									</label>
									<button class="btn-clear" on:click={clearPendingFiles} disabled={isUploadingGalleryImage}>
										<X size={14} />
										Rimuovi tutte
									</button>
								</div>
							</div>
							
							<div class="preview-grid">
								{#each pendingFiles as pf (pf.id)}
									<div class="preview-item">
										<img src={pf.preview} alt={pf.name} />
										<button class="preview-remove" on:click={() => removePendingFile(pf.id)} disabled={isUploadingGalleryImage}>
											<X size={14} />
										</button>
										<span class="preview-name">{pf.name.length > 15 ? pf.name.slice(0, 12) + '...' : pf.name}</span>
									</div>
								{/each}
							</div>

							<div class="upload-controls">
								<div class="upload-theme-select">
									<label>Assegna tema:</label>
									<select bind:value={selectedUploadTheme} disabled={isUploadingGalleryImage}>
										<option value="">Senza tema</option>
										{#each $themesStore as theme (theme.id)}
											<option value={theme.id}>{theme.nome}</option>
										{/each}
									</select>
								</div>
								
								<button 
									class="btn-upload-all" 
									on:click={uploadPendingFiles}
									disabled={isUploadingGalleryImage || pendingFiles.length === 0}
								>
									{#if isUploadingGalleryImage}
										<div class="spinner-xs"></div>
										Caricamento {uploadProgress}/{totalFilesToUpload}...
									{:else}
										<Check size={18} />
										Carica {pendingFiles.length} foto
									{/if}
								</button>
							</div>
						</div>
					{/if}
					
					{#if galleryUploadError}
						<p class="upload-error">{galleryUploadError}</p>
					{/if}
				</div>

				<!-- Gallery Grid -->
				<div class="gallery-admin-grid">
					{#each filteredGalleryImages as image (image.id)}
						<div 
							class="gallery-admin-item"
							class:dragging={draggedItem?.id === image.id}
							class:drag-over={dragOverItem?.id === image.id}
							draggable="true"
							on:dragstart={(e) => handleDragStart(e, image)}
							on:dragover={(e) => handleDragOver(e, image)}
							on:dragend={handleDragEnd}
							on:drop={(e) => handleDrop(e, image)}
							role="button"
							tabindex="0"
						>
							<div class="drag-handle">
								<GripVertical size={20} />
							</div>
							{#if image.gallery_themes}
								<div class="image-theme-badge">{image.gallery_themes.nome}</div>
							{/if}
							<div class="gallery-admin-preview" on:click|stopPropagation={() => zoomedImage = image.immagine_url} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && (zoomedImage = image.immagine_url)}>
								<img src={image.immagine_url} alt={image.alt_text || 'Gallery image'} />
								<div class="zoom-hint-gallery">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
										<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
									</svg>
								</div>
							</div>
							<div class="gallery-admin-info">
								<p class="gallery-alt">{image.alt_text || 'Nessuna descrizione'}</p>
								<span class="gallery-order">Ordine: {image.ordine}</span>
							</div>
							<div class="gallery-admin-actions">
								<button class="btn-sm-icon btn-theme" on:click|stopPropagation={() => openImageThemeModal(image)} title="Cambia tema">
									<Palette size={16} />
								</button>
								<button class="btn-sm-icon btn-edit" on:click|stopPropagation={() => openAltTextModal(image)} title="Modifica testo alternativo">
									<Edit size={16} />
								</button>
								<button class="btn-sm-icon btn-delete" on:click|stopPropagation={() => handleDeleteGalleryImage(image)} title="Elimina immagine">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					{/each}
				</div>

				{#if filteredGalleryImages.length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<ImageIcon size={64} strokeWidth={1.5} />
						</div>
						<h3>Nessuna immagine</h3>
						<p>{selectedThemeFilter === 'all' ? 'Inizia caricando la tua prima immagine nella gallery' : 'Nessuna immagine in questo tema'}</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Theme Modal -->
		{#if showThemeModal}
			<div class="modal-overlay" on:click={() => showThemeModal = false}>
				<div class="modal-category" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								<Palette size={28} class="inline-icon" />
								{editingTheme ? 'Modifica Tema' : 'Nuovo Tema'}
							</h2>
							<p class="modal-subtitle">Organizza le foto per categoria</p>
						</div>
						<button class="close-btn-modern" on:click={() => showThemeModal = false}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-category">
						<div class="form-group-modern">
							<label>Nome Tema *</label>
							<input 
								type="text" 
								bind:value={themeFormData.nome} 
								placeholder="es: Cocktail, Il Locale, Piatti..." 
								class="input-modern" 
							/>
						</div>
						<div class="form-group-modern">
							<label>Descrizione</label>
							<textarea 
								bind:value={themeFormData.descrizione} 
								placeholder="Breve descrizione del tema (opzionale)" 
								class="input-modern textarea-modern"
								rows="3"
							></textarea>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" on:click={() => showThemeModal = false}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={saveTheme} disabled={!themeFormData.nome.trim()}>
							<Check size={20} />
							{editingTheme ? 'Salva' : 'Crea Tema'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Image Theme Modal -->
		{#if showImageThemeModal}
			<div class="modal-overlay" on:click={() => showImageThemeModal = false}>
				<div class="modal-category" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								<Palette size={28} class="inline-icon" />
								Assegna Tema
							</h2>
							<p class="modal-subtitle">Sposta questa foto in un tema</p>
						</div>
						<button class="close-btn-modern" on:click={() => showImageThemeModal = false}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-category">
						{#if editingImageForTheme}
							<div class="preview-mini">
								<img src={editingImageForTheme.immagine_url} alt="Preview" />
							</div>
						{/if}
						<div class="form-group-modern">
							<label>Seleziona Tema</label>
							<select bind:value={selectedImageTheme} class="input-modern">
								<option value="">Senza Tema</option>
								{#each $themesStore as theme (theme.id)}
									<option value={theme.id}>{theme.nome}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" on:click={() => showImageThemeModal = false}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={saveImageTheme}>
							<Check size={20} />
							Assegna
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Gallery Alt Text Modal -->
		{#if showGalleryAltModal}
			<div class="modal-overlay" on:click={() => showGalleryAltModal = false}>
				<div class="modal-category" on:click|stopPropagation>
					<div class="modal-header-modern">
						<div>
							<h2>
								<Edit size={28} class="inline-icon" />
								Testo Alternativo
							</h2>
							<p class="modal-subtitle">Descrizione per accessibilità e SEO</p>
						</div>
						<button class="close-btn-modern" on:click={() => showGalleryAltModal = false}>
							<X size={24} />
						</button>
					</div>
					
					<div class="modal-body-category">
						<div class="form-group-modern">
							<label>Testo Alternativo</label>
							<input 
								type="text" 
								bind:value={galleryAltText} 
								placeholder="es: Vista del locale dall'interno" 
								class="input-modern" 
							/>
							<span class="help-text">Descrivi brevemente cosa rappresenta l'immagine</span>
						</div>
					</div>

					<div class="modal-footer-modern">
						<button class="btn-cancel-modern" on:click={() => showGalleryAltModal = false}>
							Annulla
						</button>
						<button class="btn-save-modern" on:click={saveAltText}>
							<Check size={20} />
							Salva
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
				<img src={zoomedImage} alt="Preview" class="zoomed-image" on:click|stopPropagation />
			</div>
		{/if}

		<!-- Confirm Modal -->
		{#if showConfirmModal}
			<div class="modal-overlay" on:click={confirmModalData.onCancel}>
				<div class="modal-confirm" class:danger={confirmModalData.type === 'danger'} class:warning={confirmModalData.type === 'warning'} on:click|stopPropagation>
					<div class="modal-confirm-header">
						<div class="modal-confirm-icon">
							{#if confirmModalData.type === 'danger'}
								<Trash2 size={32} />
							{:else if confirmModalData.type === 'warning'}
								<AlertTriangle size={32} />
							{:else}
								<Check size={32} />
							{/if}
						</div>
						<h3>{confirmModalData.title}</h3>
					</div>
					<div class="modal-confirm-body">
						<p>{confirmModalData.message}</p>
						{#if confirmModalData.hint}
							<div class="modal-confirm-hint">
								<Lightbulb size={18} />
								<span>{confirmModalData.hint}</span>
							</div>
						{/if}
					</div>
					<div class="modal-confirm-footer">
						<button class="btn-confirm-cancel" on:click={confirmModalData.onCancel}>
							{confirmModalData.cancelText}
						</button>
						<button class="btn-confirm-action" class:danger={confirmModalData.type === 'danger'} class:warning={confirmModalData.type === 'warning'} on:click={confirmModalData.onConfirm}>
							{confirmModalData.confirmText}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Error Modal -->
		{#if showErrorModal}
			<div class="modal-overlay" on:click={() => showErrorModal = false}>
				<div class="modal-error" on:click|stopPropagation>
					<div class="modal-error-header">
						<div class="modal-error-icon">
							<X size={32} />
						</div>
						<h3>{errorModalData.title}</h3>
					</div>
					<div class="modal-error-body">
						<p>{errorModalData.message}</p>
					</div>
					<div class="modal-error-footer">
						<button class="btn-error-ok" on:click={() => showErrorModal = false}>
							{errorModalData.buttonText}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Login Page */
	.loading-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--grigio-chiaro);
	}

	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--verde-meraki) 0%, var(--verde-dark) 100%);
		padding: 1rem;
	}

	.login-box {
		background: var(--bianco);
		padding: 2rem;
		border-radius: 16px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	.login-header {
		text-align: center;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.login-box h1 {
		color: var(--verde-meraki);
		font-size: 1.8rem;
		margin: 0;
	}

	.login-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid var(--grigio);
		border-radius: 8px;
		font-size: 1rem;
		margin-bottom: 1rem;
		box-sizing: border-box;
	}

	.login-input:focus {
		outline: none;
		border-color: var(--verde-meraki);
	}

	.login-btn {
		width: 100%;
		padding: 1rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.login-btn:hover {
		background: var(--verde-light);
	}

	.error, .error-message {
		color: #dc3545;
		text-align: center;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	/* Admin Page */
	.admin-page {
		min-height: 100vh;
		background: var(--grigio-chiaro);
	}

	.admin-header {
		background: var(--bianco);
		border-bottom: 2px solid var(--grigio);
		padding: 1rem;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.home-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		text-decoration: none;
		border-radius: 50px;
		font-weight: 600;
		font-size: 0.95rem;
		transition: all 0.3s ease;
	}

	.home-button:hover {
		background: var(--verde-light);
		transform: translateX(-3px);
	}

	.header-content h1 {
		color: var(--verde-meraki);
		flex: 1;
		text-align: center;
		font-size: 1.5rem;
	}

	/* Content */
	.content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	/* Home Grid */
	.home-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.nav-card {
		background: var(--bianco);
		padding: 2.5rem;
		border-radius: 20px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
		border: 3px solid transparent;
	}

	.nav-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 40px rgba(21, 67, 21, 0.2);
		border-color: var(--verde-meraki);
	}

	.nav-icon {
		margin-bottom: 1.5rem;
		color: var(--verde-meraki);
	}

	.nav-card h3 {
		color: var(--verde-meraki);
		font-size: 1.5rem;
		margin-bottom: 0.8rem;
	}

	.nav-card p {
		color: var(--grigio-scuro);
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.nav-stats {
		padding-top: 1rem;
		border-top: 2px solid var(--grigio);
		color: var(--verde-meraki);
		font-weight: 600;
	}

	.btn-back {
		background: var(--grigio);
		color: var(--nero);
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 12px;
		font-weight: 500;
		cursor: pointer;
		margin-bottom: 2rem;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
	}

	.btn-back:hover {
		background: var(--grigio-scuro);
		color: var(--bianco);
	}

	/* Toolbar */
	.toolbar {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.btn-primary {
		padding: 1rem 2rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.3);
	}

	.btn-primary:hover {
		background: var(--verde-light);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(21, 67, 21, 0.4);
	}

	.search-wrapper {
		flex: 1;
		min-width: 250px;
		position: relative;
	}

	.search-icon-wrapper {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--grigio-scuro);
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: 0.9rem 1rem 0.9rem 3rem;
		border: 2px solid var(--grigio);
		border-radius: 12px;
		background: var(--bianco);
		font-size: 0.95rem;
		transition: all 0.3s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--verde-meraki);
		box-shadow: 0 0 0 3px rgba(21, 67, 21, 0.1);
	}

	.clear-search {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: var(--grigio);
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-search:hover {
		background: var(--grigio-scuro);
		color: var(--bianco);
	}

	.filter-select {
		padding: 0.9rem 1rem;
		border: 2px solid var(--grigio);
		border-radius: 12px;
		background: var(--bianco);
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--verde-meraki);
	}

	/* Products Grid */
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.product-card {
		background: var(--bianco);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.product-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.15);
		border-color: var(--verde-meraki);
	}

	.product-image {
		width: 100%;
		height: 180px;
		overflow: hidden;
		position: relative;
		background: linear-gradient(135deg, var(--grigio-chiaro) 0%, var(--grigio) 100%);
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.product-card:hover .product-image img {
		transform: scale(1.05);
	}

	.image-overlay {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
	}

	.overlay-badge {
		background: rgba(21, 67, 21, 0.95);
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.product-card-body {
		padding: 1.2rem;
	}

	.product-badges {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.8rem;
		flex-wrap: wrap;
	}

	.category-badge {
		background: var(--verde-meraki);
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.click-badge {
		background: #ffc107;
		color: #000;
		padding: 0.3rem 0.8rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.product-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--nero);
		margin-bottom: 0.3rem;
		line-height: 1.3;
	}

	.product-subcategory {
		font-size: 0.85rem;
		color: var(--verde-meraki);
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.product-desc-preview {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		line-height: 1.5;
		margin-bottom: 1rem;
		min-height: 40px;
	}

	.product-price-row {
		padding: 0.8rem 0;
		border-top: 1px solid var(--grigio);
		border-bottom: 1px solid var(--grigio);
		margin-bottom: 1rem;
	}

	.price-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.price-label {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
	}

	.price-range {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--verde-meraki);
	}

	.price-single {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--verde-meraki);
	}

	.product-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-card {
		flex: 1;
		padding: 0.7rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
	}

	.btn-edit {
		background: #007bff;
		color: white;
	}

	.btn-edit:hover {
		background: #0056b3;
	}

	.btn-delete-icon {
		width: 42px;
		padding: 0.7rem;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.btn-delete-icon:hover {
		background: #c82333;
	}

	/* Availability Toggle Button */
	.btn-availability {
		width: 42px;
		padding: 0.7rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		font-weight: 600;
	}

	.btn-availability.available {
		background: #28a745;
		color: white;
	}

	.btn-availability.available:hover {
		background: #218838;
	}

	.btn-availability.unavailable {
		background: #6c757d;
		color: white;
	}

	.btn-availability.unavailable:hover {
		background: #5a6268;
	}

	/* Unavailable Badge */
	.unavailable-badge {
		background: #dc3545;
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	/* Unavailable Product Card */
	.product-card.unavailable {
		opacity: 0.7;
		border: 2px solid #dc3545;
	}

	.product-card.unavailable .product-image {
		filter: grayscale(50%);
	}

	.product-card.unavailable:hover {
		opacity: 0.85;
		border-color: #dc3545;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bianco);
		border-radius: 16px;
	}

	.empty-icon {
		margin-bottom: 1rem;
		opacity: 0.3;
		color: var(--grigio-scuro);
		display: flex;
		justify-content: center;
	}

	.empty-state h3 {
		color: var(--nero);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: var(--grigio-scuro);
	}

	/* Modal Modern */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		overflow-y: auto;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-modern {
		background: var(--grigio-chiaro);
		border-radius: 24px;
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header-modern {
		padding: 2rem;
		background: var(--bianco);
		border-radius: 24px 24px 0 0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 2px solid var(--grigio);
	}

	.modal-header-modern h2 {
		color: var(--verde-meraki);
		font-size: 1.8rem;
		margin-bottom: 0.3rem;
	}

	.modal-subtitle {
		color: var(--grigio-scuro);
		font-size: 0.9rem;
		font-weight: 400;
	}

	.close-btn-modern {
		background: var(--grigio-chiaro);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--grigio-scuro);
		transition: all 0.3s ease;
	}

	.close-btn-modern:hover {
		background: var(--grigio);
		color: var(--nero);
		transform: rotate(90deg);
	}

	.modal-body-modern {
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	/* Form Sections */
	.form-section {
		background: var(--bianco);
		padding: 2rem;
		margin-bottom: 1rem;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--verde-meraki);
		font-size: 1.3rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.8rem;
		border-bottom: 2px solid var(--grigio);
	}

	.inline-icon {
		display: inline-block;
		vertical-align: middle;
		margin-right: 0.5rem;
	}

	.form-group-modern {
		margin-bottom: 1.5rem;
	}

	.form-group-modern label {
		display: block;
		margin-bottom: 0.6rem;
		font-weight: 600;
		color: var(--nero);
		font-size: 0.95rem;
	}

	.input-modern,
	.select-modern,
	.textarea-modern {
		width: 100%;
		padding: 0.9rem 1rem;
		border: 2px solid var(--grigio);
		border-radius: 12px;
		font-size: 1rem;
		background: var(--grigio-chiaro);
		transition: all 0.3s ease;
		box-sizing: border-box;
	}

	.input-modern:focus,
	.select-modern:focus,
	.textarea-modern:focus {
		outline: none;
		border-color: var(--verde-meraki);
		background: var(--bianco);
		box-shadow: 0 0 0 3px rgba(21, 67, 21, 0.1);
	}

	.textarea-modern {
		resize: vertical;
		font-family: inherit;
	}

	.form-row-modern {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	/* Upload Area */
	.upload-area {
		margin-top: 0.5rem;
	}

	.upload-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 2rem;
		border: 3px dashed var(--grigio);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		background: var(--grigio-chiaro);
	}

	.upload-label:hover {
		border-color: var(--verde-meraki);
		background: #f8fdf8;
	}

	.upload-label.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.upload-label svg {
		color: var(--grigio-scuro);
		margin-bottom: 1rem;
	}

	.upload-label span {
		display: block;
		color: var(--nero);
		font-weight: 500;
	}

	.upload-hint {
		font-size: 0.85rem !important;
		color: var(--grigio-scuro) !important;
		margin-top: 0.5rem;
	}

	.image-preview-modern {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
	}

	.image-preview-modern img {
		width: 100%;
		height: 300px;
		object-fit: cover;
		display: block;
	}

	.image-overlay-preview {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.image-preview-modern:hover .image-overlay-preview {
		opacity: 1;
	}

	.btn-remove-image {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.btn-remove-image:hover {
		background: #c82333;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(21, 67, 21, 0.3);
		border-top-color: var(--verde-meraki);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Pricing Toggle */
	.pricing-toggle {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		background: var(--grigio-chiaro);
		border-radius: 12px;
		padding: 0.5rem;
	}

	.toggle-btn {
		flex: 1;
		padding: 0.8rem;
		border: none;
		background: transparent;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.toggle-btn.active {
		background: var(--verde-meraki);
		color: white;
	}

	/* Prices */
	.price-input-wrapper {
		position: relative;
	}

	.currency {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		font-weight: 600;
		color: var(--grigio-scuro);
	}

	.price-input {
		padding-left: 2.5rem !important;
	}

	/* Variants */
	.variants-list {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.variant-item {
		display: grid;
		grid-template-columns: 40px 1fr 150px 40px;
		gap: 0.8rem;
		align-items: center;
		padding: 0.8rem;
		background: var(--grigio-chiaro);
		border-radius: 12px;
		border: 2px solid var(--grigio);
	}

	.variant-number {
		width: 32px;
		height: 32px;
		background: var(--verde-meraki);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.btn-remove-variant {
		width: 32px;
		height: 32px;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.btn-remove-variant:hover {
		background: #c82333;
	}

	.btn-add-variant {
		background: var(--verde-meraki);
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.btn-add-variant:hover {
		background: var(--verde-light);
	}

	/* Modal Footer Modern */
	.modal-footer-modern {
		padding: 1.5rem 2rem;
		background: var(--bianco);
		border-top: 2px solid var(--grigio);
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		border-radius: 0 0 24px 24px;
	}

	.btn-cancel-modern {
		padding: 0.9rem 2rem;
		background: var(--grigio);
		color: var(--nero);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-cancel-modern:hover {
		background: var(--grigio-scuro);
		color: var(--bianco);
	}

	.btn-save-modern {
		padding: 0.9rem 2rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 4px 12px rgba(21, 67, 21, 0.3);
	}

	.btn-save-modern:hover:not(:disabled) {
		background: var(--verde-light);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(21, 67, 21, 0.4);
	}

	.btn-save-modern:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Categories Management */
	.categories-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.category-item {
		background: var(--bianco);
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--grigio);
	}

	.category-info h3 {
		color: var(--verde-meraki);
		font-size: 1.4rem;
		margin-bottom: 0.3rem;
	}

	.subcategories-count {
		font-size: 0.9rem;
		color: var(--grigio-scuro);
	}

	.category-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-sm-icon {
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.btn-sm-icon.btn-edit {
		background: #007bff;
		color: white;
	}

	.btn-sm-icon.btn-edit:hover {
		background: #0056b3;
	}

	.btn-sm-icon.btn-delete {
		background: #dc3545;
		color: white;
	}

	.btn-sm-icon.btn-delete:hover {
		background: #c82333;
	}

	.subcategories-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		margin-bottom: 1rem;
	}

	.subcategory-tag {
		background: var(--verde-meraki);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.remove-subcat {
		background: rgba(255, 255, 255, 0.3);
		border: none;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: white;
		transition: all 0.2s ease;
	}

	/* Category order arrows */
	.category-order-arrows {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-right: 1rem;
	}

	.btn-arrow {
		width: 28px;
		height: 28px;
		border: 1px solid var(--grigio);
		background: var(--bianco);
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--grigio-scuro);
		transition: all 0.2s ease;
	}

	.btn-arrow:hover:not(:disabled) {
		background: var(--verde-meraki);
		border-color: var(--verde-meraki);
		color: white;
	}

	.btn-arrow:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Draggable subcategories */
	.subcategories-list-draggable {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.drag-hint {
		font-size: 0.75rem;
		color: var(--grigio-scuro);
		margin-bottom: 0.25rem;
		font-style: italic;
	}

	.subcategory-tag-draggable {
		background: var(--verde-meraki);
		color: white;
		padding: 0.6rem 1rem;
		border-radius: 10px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: grab;
		transition: all 0.2s ease;
		user-select: none;
	}

	.subcategory-tag-draggable:active {
		cursor: grabbing;
	}

	.subcategory-tag-draggable.dragging {
		opacity: 0.5;
		transform: scale(0.98);
	}

	.subcategory-tag-draggable.drag-over {
		background: #1a5a1a;
		border: 2px dashed white;
	}

	.subcategory-tag-draggable :global(.drag-handle) {
		opacity: 0.7;
		flex-shrink: 0;
	}

	.subcategory-tag-draggable span {
		flex: 1;
	}

	/* Eventi Section */
	.eventi-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.evento-item {
		background: var(--bianco);
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		display: grid;
		grid-template-columns: 200px 1fr auto;
		gap: 1.5rem;
		align-items: center;
		border: 3px solid transparent;
		transition: all 0.3s ease;
	}

	.evento-item.active {
		border-color: #FF4444;
		box-shadow: 0 4px 20px rgba(255, 68, 68, 0.2);
	}

	.evento-preview {
		position: relative;
		width: 200px;
		height: 150px;
		border-radius: 12px;
		overflow: hidden;
		background: var(--grigio-chiaro);
	}

	.evento-preview.clickable {
		cursor: zoom-in;
	}

	.evento-preview.clickable:hover img {
		transform: scale(1.05);
	}

	.evento-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.zoom-hint-admin {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		width: 32px;
		height: 32px;
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

	.evento-preview.clickable:hover .zoom-hint-admin {
		opacity: 1;
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--grigio-scuro);
	}

	.stato-badge-admin {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		padding: 0.4rem 0.8rem;
		color: white;
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		border-radius: 6px;
		animation: pulse 2s ease-in-out infinite;
	}

	.stato-badge-admin.in-corso {
		background: #22c55e;
	}

	.stato-badge-admin.in-arrivo {
		background: #f59e0b;
	}

	.evento-item.upcoming {
		border-color: #f59e0b;
	}

	.evento-details {
		flex: 1;
	}

	.evento-details h3 {
		color: var(--verde-meraki);
		font-size: 1.4rem;
		margin-bottom: 0.5rem;
	}

	.evento-dates,
	.evento-orario {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--grigio-scuro);
		margin: 0.3rem 0;
	}

	.evento-desc {
		color: var(--nero);
		margin-top: 0.5rem;
		line-height: 1.5;
	}

	.evento-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Image Zoom Modal */
	.zoom-modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 9999;
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
		z-index: 10000;
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

	@media (max-width: 768px) {
		.evento-item {
			grid-template-columns: 1fr;
		}

		.evento-preview {
			width: 100%;
		}
	}

	.remove-subcat:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	.add-subcategory {
		display: flex;
		gap: 0.8rem;
		align-items: center;
	}

	.input-subcategory {
		flex: 1;
		padding: 0.7rem 1rem;
		border: 2px solid var(--grigio);
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.input-subcategory:focus {
		outline: none;
		border-color: var(--verde-meraki);
	}

	.btn-add-subcat {
		background: var(--verde-meraki);
		color: white;
		border: none;
		padding: 0.7rem 1.2rem;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		white-space: nowrap;
		transition: all 0.3s ease;
	}

	.btn-add-subcat:hover {
		background: var(--verde-light);
	}

	/* Category Modal */
	.modal-category {
		background: var(--bianco);
		border-radius: 24px;
		width: 100%;
		max-width: 500px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
	}

	.modal-body-category {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.macro-category-selector {
		display: flex;
		gap: 0.75rem;
	}

	.macro-option {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 0.5rem;
		background: var(--grigio-chiaro);
		border: 2px solid transparent;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.macro-option:hover {
		background: #e8e8e8;
	}

	.macro-option.selected {
		background: rgba(21, 67, 21, 0.1);
		border-color: var(--verde-meraki);
	}

	.macro-option-icon {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.macro-option span {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--grigio-scuro);
		text-align: center;
	}

	.macro-option.selected span {
		color: var(--verde-meraki);
	}

	/* Gallery Management - Redesigned */
	
	/* Header Bar */
	.gallery-header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bianco);
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.gallery-stats {
		display: flex;
		gap: 1.5rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		color: var(--grigio-scuro);
		font-weight: 500;
	}

	.btn-manage-themes {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid var(--verde-meraki);
		color: var(--verde-meraki);
		border-radius: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-manage-themes:hover {
		background: var(--verde-meraki);
		color: var(--bianco);
	}

	/* Themes Panel - Collapsible */
	.themes-panel {
		background: var(--bianco);
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 1rem;
		border: 2px solid var(--verde-meraki);
		animation: slideDown 0.2s ease;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.themes-panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--grigio);
	}

	.themes-panel-header h4 {
		margin: 0;
		font-size: 0.95rem;
		color: var(--nero);
	}

	.btn-add-theme-sm {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0.8rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-add-theme-sm:hover {
		background: var(--verde-light);
	}

	.themes-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.theme-card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--grigio-chiaro);
		border-radius: 8px;
		transition: all 0.2s;
	}

	.theme-card:hover {
		background: var(--grigio);
	}

	.theme-card-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.theme-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--nero);
	}

	.theme-photo-count {
		font-size: 0.7rem;
		color: var(--grigio-scuro);
	}

	.theme-card-actions {
		display: flex;
		gap: 0.25rem;
	}

	.btn-icon-xs {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--grigio-scuro);
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-icon-xs:hover {
		background: var(--bianco);
		color: var(--verde-meraki);
	}

	.btn-icon-xs.danger:hover {
		color: #dc3545;
	}

	.no-themes {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		font-style: italic;
		margin: 0;
	}

	/* Filter Chips - Horizontal Scroll */
	.gallery-filters-wrapper {
		margin-bottom: 1rem;
		overflow: hidden;
	}

	.gallery-filters {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding: 0.5rem 0;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.gallery-filters::-webkit-scrollbar {
		display: none;
	}

	.filter-chip {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		background: var(--bianco);
		border: 2px solid var(--grigio);
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--grigio-scuro);
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.filter-chip:hover {
		border-color: var(--verde-meraki);
		color: var(--verde-meraki);
	}

	.filter-chip.active {
		background: var(--verde-meraki);
		border-color: var(--verde-meraki);
		color: var(--bianco);
	}

	.chip-count {
		padding: 0.1rem 0.4rem;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		font-size: 0.75rem;
	}

	.filter-chip.active .chip-count {
		background: rgba(255, 255, 255, 0.25);
	}

	/* Upload Zone - Redesigned */
	.upload-zone {
		background: var(--bianco);
		border: 2px dashed var(--grigio);
		border-radius: 12px;
		margin-bottom: 1.5rem;
		transition: all 0.3s ease;
	}

	.upload-zone.dragging {
		border-color: var(--verde-meraki);
		background: rgba(21, 67, 21, 0.03);
		transform: scale(1.01);
	}

	.upload-zone.has-files {
		border-style: solid;
		border-color: var(--verde-meraki);
	}

	.upload-empty {
		padding: 2rem;
	}

	.upload-trigger {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 1rem;
	}

	.upload-icon {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--grigio-chiaro);
		border-radius: 50%;
		color: var(--verde-meraki);
		margin-bottom: 0.5rem;
	}

	.upload-text {
		font-size: 0.95rem;
		color: var(--grigio-scuro);
	}

	.upload-text strong {
		color: var(--verde-meraki);
	}

	.upload-hint {
		font-size: 0.8rem;
		color: var(--grigio-scuro);
		opacity: 0.8;
	}

	/* Upload Preview Section */
	.upload-preview-section {
		padding: 1rem;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--grigio);
	}

	.preview-count {
		font-weight: 600;
		color: var(--verde-meraki);
		font-size: 0.9rem;
	}

	.preview-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-add-more, .btn-clear {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-add-more {
		background: var(--grigio-chiaro);
		border: 1px solid var(--grigio);
		color: var(--nero);
	}

	.btn-add-more:hover {
		background: var(--grigio);
	}

	.btn-clear {
		background: transparent;
		border: 1px solid #dc3545;
		color: #dc3545;
	}

	.btn-clear:hover {
		background: #dc3545;
		color: white;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.preview-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
		background: var(--grigio-chiaro);
	}

	.preview-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.preview-remove {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(220, 53, 69, 0.9);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s;
	}

	.preview-remove:hover {
		background: #dc3545;
		transform: scale(1.1);
	}

	.preview-name {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.3rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		font-size: 0.65rem;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Upload Controls */
	.upload-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--grigio);
	}

	.upload-theme-select {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.upload-theme-select label {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		white-space: nowrap;
	}

	.upload-theme-select select {
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--grigio);
		border-radius: 6px;
		font-size: 0.85rem;
		background: var(--bianco);
	}

	.btn-upload-all {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.5rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-upload-all:hover:not(:disabled) {
		background: var(--verde-light);
		transform: translateY(-1px);
	}

	.btn-upload-all:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner-xs {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.upload-error {
		margin: 0.75rem 0 0 0;
		padding: 0.5rem 1rem;
		background: rgba(220, 53, 69, 0.1);
		color: #dc3545;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	/* Image Theme Badge */
	.image-theme-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.3rem 0.7rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		font-size: 0.7rem;
		font-weight: 600;
		border-radius: 12px;
		z-index: 5;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn-sm-icon.btn-theme {
		background: #6f42c1;
	}

	.btn-sm-icon.btn-theme:hover {
		background: #5a32a3;
	}

	/* Preview Mini */
	.preview-mini {
		width: 100%;
		max-width: 200px;
		aspect-ratio: 1;
		margin: 0 auto 1.5rem;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.preview-mini img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.textarea-modern {
		resize: vertical;
		min-height: 80px;
	}

	.gallery-admin-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.gallery-admin-item {
		background: var(--bianco);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		border: 2px solid transparent;
		cursor: grab;
		position: relative;
	}

	.gallery-admin-item:active {
		cursor: grabbing;
	}

	.gallery-admin-item.dragging {
		opacity: 0.5;
		transform: scale(0.95);
	}

	.gallery-admin-item.drag-over {
		border-color: var(--verde-meraki);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.2);
	}

	.gallery-admin-item:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 24px rgba(21, 67, 21, 0.15);
		border-color: var(--verde-meraki);
	}

	.drag-handle {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
		z-index: 10;
		background: rgba(21, 67, 21, 0.9);
		color: white;
		padding: 0.5rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		transition: all 0.3s ease;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.gallery-admin-item:hover .drag-handle {
		background: var(--verde-meraki);
	}

	.gallery-admin-preview {
		width: 100%;
		height: 250px;
		overflow: hidden;
		position: relative;
		background: var(--grigio-chiaro);
		cursor: zoom-in;
	}

	.gallery-admin-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.gallery-admin-item:hover .gallery-admin-preview img {
		transform: scale(1.05);
	}

	.zoom-hint-gallery {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		width: 32px;
		height: 32px;
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

	.gallery-admin-preview:hover .zoom-hint-gallery {
		opacity: 1;
	}

	.gallery-admin-info {
		padding: 1rem;
		border-bottom: 1px solid var(--grigio);
	}

	.gallery-alt {
		font-size: 0.9rem;
		color: var(--nero);
		margin-bottom: 0.5rem;
		line-height: 1.4;
		min-height: 40px;
		font-style: italic;
	}

	.gallery-order {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		font-weight: 600;
	}

	.gallery-admin-actions {
		padding: 0.8rem 1rem;
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	.spinner-small {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.inline-error {
		margin: 0;
		padding: 0.5rem 1rem;
		background: #fee;
		border-radius: 8px;
	}

	.help-text {
		font-size: 0.85rem;
		color: var(--grigio-scuro);
		display: block;
		margin-top: 0.5rem;
	}

	.btn-primary.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Toggle Card */
	.toggle-card {
		padding: 1.2rem;
		border: 2px solid var(--grigio);
		border-radius: 12px;
		margin-bottom: 1rem;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.toggle-card.active {
		border-color: var(--verde-meraki);
		background: rgba(21, 67, 21, 0.05);
	}

	.toggle-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.toggle-info {
		flex: 1;
	}

	.toggle-info strong {
		color: var(--verde-meraki);
		font-size: 1rem;
		display: block;
		margin-bottom: 0.3rem;
	}

	.toggle-info p {
		color: var(--grigio-scuro);
		font-size: 0.9rem;
		margin: 0;
	}

	.detail-section-modern {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px dashed var(--grigio);
	}

	/* Confirm Modal */
	.modal-confirm {
		background: var(--bianco);
		border-radius: 20px;
		width: 100%;
		max-width: 450px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
		border: 3px solid var(--grigio);
	}

	.modal-confirm.danger {
		border-color: #dc3545;
	}

	.modal-confirm.warning {
		border-color: #ffc107;
	}

	.modal-confirm-header {
		padding: 2rem 2rem 1rem 2rem;
		text-align: center;
	}

	.modal-confirm-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem auto;
		background: var(--grigio-chiaro);
		color: var(--grigio-scuro);
	}

	.modal-confirm.danger .modal-confirm-icon {
		background: rgba(220, 53, 69, 0.1);
		color: #dc3545;
	}

	.modal-confirm.warning .modal-confirm-icon {
		background: rgba(255, 193, 7, 0.1);
		color: #ffc107;
	}

	.modal-confirm-header h3 {
		color: var(--nero);
		font-size: 1.5rem;
		margin: 0;
		font-weight: 700;
	}

	.modal-confirm-body {
		padding: 0 2rem 1.5rem 2rem;
		text-align: center;
	}

	.modal-confirm-body p {
		color: var(--grigio-scuro);
		font-size: 1rem;
		line-height: 1.5;
		margin: 0;
		white-space: pre-line;
	}

	.modal-confirm-hint {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-top: 1.25rem;
		padding: 1rem;
		background: rgba(21, 67, 21, 0.06);
		border-radius: 10px;
		border-left: 3px solid var(--verde-meraki);
		text-align: left;
	}

	.modal-confirm-hint :global(svg) {
		flex-shrink: 0;
		color: var(--verde-meraki);
		margin-top: 2px;
	}

	.modal-confirm-hint span {
		color: var(--nero);
		font-size: 0.9rem;
		line-height: 1.5;
		font-weight: 500;
	}

	.modal-confirm-footer {
		padding: 1.5rem 2rem 2rem 2rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-confirm-cancel {
		flex: 1;
		padding: 1rem 2rem;
		background: var(--grigio);
		color: var(--nero);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
	}

	.btn-confirm-cancel:hover {
		background: var(--grigio-scuro);
		color: var(--bianco);
	}

	.btn-confirm-action {
		flex: 1;
		padding: 1rem 2rem;
		background: var(--verde-meraki);
		color: var(--bianco);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
	}

	.btn-confirm-action.danger {
		background: #dc3545;
	}

	.btn-confirm-action.danger:hover {
		background: #c82333;
	}

	.btn-confirm-action.warning {
		background: #ffc107;
		color: #000;
	}

	.btn-confirm-action.warning:hover {
		background: #e0a800;
	}

	.btn-confirm-action:hover:not(.danger):not(.warning) {
		background: var(--verde-light);
	}

	/* Error Modal */
	.modal-error {
		background: var(--bianco);
		border-radius: 20px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease;
		border: 3px solid #dc3545;
	}

	.modal-error-header {
		padding: 2rem 2rem 1rem 2rem;
		text-align: center;
	}

	.modal-error-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem auto;
		background: rgba(220, 53, 69, 0.1);
		color: #dc3545;
	}

	.modal-error-header h3 {
		color: var(--nero);
		font-size: 1.5rem;
		margin: 0;
		font-weight: 700;
	}

	.modal-error-body {
		padding: 0 2rem 1.5rem 2rem;
		text-align: center;
	}

	.modal-error-body p {
		color: var(--grigio-scuro);
		font-size: 1rem;
		line-height: 1.5;
		margin: 0;
	}

	.modal-error-footer {
		padding: 1.5rem 2rem 2rem 2rem;
		display: flex;
		justify-content: center;
	}

	.btn-error-ok {
		padding: 1rem 3rem;
		background: #dc3545;
		color: var(--bianco);
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
	}

	.btn-error-ok:hover {
		background: #c82333;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.home-grid {
			grid-template-columns: 1fr;
		}

		.toolbar {
			flex-direction: column;
		}

		.search-wrapper {
			width: 100%;
		}

		.filter-select {
			width: 100%;
		}

		.products-grid {
			grid-template-columns: 1fr;
		}

		.gallery-admin-grid {
			grid-template-columns: 1fr;
		}

		.form-row-modern {
			grid-template-columns: 1fr;
		}

		.variant-item {
			grid-template-columns: 30px 1fr 120px 30px;
			gap: 0.5rem;
		}

		.modal-header-modern {
			padding: 1.5rem;
		}

		.modal-header-modern h2 {
			font-size: 1.4rem;
		}

		.form-section {
			padding: 1.5rem;
		}

		.modal-footer-modern {
			padding: 1rem 1.5rem;
			flex-direction: column;
		}

		.btn-cancel-modern,
		.btn-save-modern {
			width: 100%;
			justify-content: center;
		}

		/* Gallery Mobile */
		.gallery-header-bar {
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}

		.gallery-stats {
			justify-content: center;
		}

		.btn-manage-themes {
			justify-content: center;
		}

		.themes-grid {
			justify-content: center;
		}

		.preview-header {
			flex-direction: column;
			gap: 0.75rem;
			align-items: stretch;
		}

		.preview-actions {
			justify-content: center;
		}

		.preview-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.upload-controls {
			flex-direction: column;
			gap: 0.75rem;
		}

		.upload-theme-select {
			width: 100%;
			justify-content: center;
		}

		.btn-upload-all {
			width: 100%;
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.preview-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.gallery-filters {
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}
	}
</style>
