<script>
	export let allergens = [];
	export let size = 20;
	export let className = '';
	
	// Mapping allergeni -> icone custom verdi (WebP ottimizzate)
	const allergenIconMap = {
		glutine: { src: '/icone-allergeni/glutine.webp', label: 'Glutine' },
		latticini: { src: '/icone-allergeni/latticini.webp', label: 'Latticini' },
		uova: { src: '/icone-allergeni/uova.webp', label: 'Uova' },
		pesce: { src: '/icone-allergeni/pesce.webp', label: 'Pesce' },
		arachidi: { src: '/icone-allergeni/arachidi.webp', label: 'Arachidi' },
		frutta_guscio: { src: '/icone-allergeni/frutta_guscio.webp', label: 'Frutta a guscio' },
		soia: { src: '/icone-allergeni/soia.webp', label: 'Soia' },
		sedano: { src: '/icone-allergeni/sedano.webp', label: 'Sedano' },
		senape: { src: '/icone-allergeni/senape.webp', label: 'Senape' },
		sesamo: { src: '/icone-allergeni/sesamo.webp', label: 'Sesamo' },
		solfiti: { src: '/icone-allergeni/solfiti.webp', label: 'Solfiti' },
		crostacei: { src: '/icone-allergeni/crostacei.webp', label: 'Crostacei' },
		molluschi: { src: '/icone-allergeni/molluschi.webp', label: 'Molluschi' },
		lupini: { src: '/icone-allergeni/lupini.webp', label: 'Lupini' }
	};
	
	// Filtra solo allergeni validi
	$: validAllergens = (allergens || []).filter(a => allergenIconMap[a]);
</script>

{#if validAllergens.length > 0}
	<div class="allergen-icons {className}">
		{#each validAllergens as allergen}
			{@const config = allergenIconMap[allergen]}
			<span class="allergen-icon" title={config.label}>
				<img src={config.src} alt={config.label} width={size} height={size} />
			</span>
		{/each}
	</div>
{/if}

<style>
	.allergen-icons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		margin-top: 0.4rem;
	}
	
	.allergen-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		opacity: 0.9;
	}
	
	.allergen-icon:hover {
		opacity: 1;
		transform: scale(1.15);
	}
	
	.allergen-icon img {
		display: block;
	}
	
	/* Stile per card con sfondo immagine (icone con sfondo bianco per visibilità) */
	:global(.has-image) .allergen-icon {
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 4px;
		padding: 2px;
	}
	
	:global(.has-image) .allergen-icon:hover {
		background-color: rgba(255, 255, 255, 1);
	}
</style>
