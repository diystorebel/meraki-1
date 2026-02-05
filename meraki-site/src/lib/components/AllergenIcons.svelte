<script>
	import { Wheat, Milk, Egg, Fish, Nut, Leaf, Sprout, AlertCircle, Droplet, Grape, Shell } from 'lucide-svelte';
	
	export let allergens = [];
	export let size = 14;
	export let className = '';
	
	// Mapping allergeni -> icone Lucide
	const allergenIconMap = {
		glutine: { icon: Wheat, label: 'Glutine' },
		latticini: { icon: Milk, label: 'Latticini' },
		uova: { icon: Egg, label: 'Uova' },
		pesce: { icon: Fish, label: 'Pesce' },
		arachidi: { icon: Nut, label: 'Arachidi' },
		frutta_guscio: { icon: Nut, label: 'Frutta a guscio' },
		soia: { icon: Leaf, label: 'Soia' },
		sedano: { icon: Sprout, label: 'Sedano' },
		senape: { icon: Sprout, label: 'Senape' },
		sesamo: { icon: Sprout, label: 'Sesamo' },
		solfiti: { icon: Grape, label: 'Solfiti' },
		crostacei: { icon: Shell, label: 'Crostacei' },
		molluschi: { icon: Shell, label: 'Molluschi' },
		lupini: { icon: Leaf, label: 'Lupini' }
	};
	
	// Filtra solo allergeni validi
	$: validAllergens = (allergens || []).filter(a => allergenIconMap[a]);
</script>

{#if validAllergens.length > 0}
	<div class="allergen-icons {className}">
		{#each validAllergens as allergen}
			{@const config = allergenIconMap[allergen]}
			<span class="allergen-icon" title={config.label}>
				<svelte:component this={config.icon} size={size} strokeWidth={1.5} />
			</span>
		{/each}
	</div>
{/if}

<style>
	.allergen-icons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
		margin-top: 0.4rem;
	}
	
	.allergen-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: rgba(0, 0, 0, 0.5);
		transition: color 0.2s ease;
	}
	
	.allergen-icon:hover {
		color: rgba(0, 0, 0, 0.8);
	}
	
	/* Stile per card con sfondo immagine (testo bianco) */
	:global(.has-image) .allergen-icon {
		color: rgba(255, 255, 255, 0.7);
	}
	
	:global(.has-image) .allergen-icon:hover {
		color: rgba(255, 255, 255, 1);
	}
</style>
