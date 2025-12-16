/**
 * Smart Search Engine per Menu
 * 
 * Features:
 * - Word boundary matching per termini brevi (gin ≠ ginger)
 * - Dizionario sinonimi IT/EN (zenzero → ginger)
 * - Tag semantici (speziato → paprika, pepe, curry...)
 * - Scoring system (nome > descrizione)
 */

// ============================================
// DIZIONARIO SINONIMI E TRADUZIONI
// ============================================
const SYNONYMS = {
	// Traduzioni IT → EN (ingredienti comuni)
	'zenzero': ['ginger'],
	'limone': ['lemon', 'lime'],
	'arancia': ['orange'],
	'pompelmo': ['grapefruit'],
	'menta': ['mint', 'menta fresca'],
	'basilico': ['basil'],
	'cannella': ['cinnamon'],
	'liquirizia': ['licorice', 'liquirizia'],
	'sambuco': ['elderflower', 'fiori di sambuco'],
	'vaniglia': ['vanilla'],
	'mandorla': ['almond', 'orzata'],
	'caffè': ['coffee', 'espresso', 'borghetti'],
	'cioccolato': ['chocolate', 'cacao', 'nutella'],
	'fragola': ['strawberry'],
	'mirtillo': ['blueberry', 'cranberry'],
	'ananas': ['pineapple'],
	'pesca': ['peach'],
	'ciliegia': ['cherry', 'maraschino'],
	'passione': ['passion fruit', 'passoa', 'passion'],
	'mela': ['apple', 'mele'],
	'nocciola': ['hazelnut', 'frangelico'],
	'cocco': ['coconut'],
	'melone': ['melon'],
	
	// Traduzioni EN → IT
	'ginger': ['zenzero'],
	'lemon': ['limone'],
	'orange': ['arancia'],
	'mint': ['menta'],
	'pepper': ['pepe'],
	'spicy': ['speziato', 'piccante'],
	'sweet': ['dolce'],
	'bitter': ['amaro'],
	'sour': ['acido', 'aspro'],
	
	// Categorie flavor/gusto
	'speziato': ['paprika', 'pepe', 'curry', 'cardamomo', 'chiodi di garofano', 'noce moscata', 'sansho', 'sichuan', 'cubebe', 'galanga'],
	'piccante': ['chili', 'peperoncino', 'jalapeño', 'tabasco', 'furente'],
	'agrumato': ['limone', 'lime', 'arancia', 'pompelmo', 'yuzu', 'bergamotto', 'cedro', 'agrumi'],
	'amaro': ['campari', 'angostura', 'fernet', 'montenegro', 'bitter', 'select', 'zucca'],
	'fruttato': ['frutta', 'mirtillo', 'fragola', 'pesca', 'passion', 'ananas', 'mela'],
	'floreale': ['fiori', 'violetta', 'gelsomino', 'sambuco', 'rosa', 'ibisco', 'camomilla'],
	'affumicato': ['smoke', 'smoky', 'mezcal', 'peat', 'torbato'],
	'fresco': ['menta', 'cetriolo', 'lime', 'soda', 'tonica'],
	'tropicale': ['ananas', 'passion', 'cocco', 'mango', 'banana', 'rum'],
	'erbaceo': ['basilico', 'menta', 'rosmarino', 'timo', 'alloro', 'mirto'],
	'cremoso': ['baileys', 'cream', 'crema', 'caprino', 'brie', 'scamorza'],
	
	// Spirit categories
	'whiskey': ['whisky', 'bourbon', 'rye', 'scotch'],
	'whisky': ['whiskey', 'bourbon', 'rye', 'scotch'],
	'tequila': ['mezcal', 'agave'],
	'rhum': ['rum', 'cachaca', 'caҫhaca'],
	
	// Food categories
	'vegano': ['vegan', 'verdure', 'melanzane', 'zucchine', 'quinoa'],
	'vegetariano': ['verdure', 'melanzane', 'zucchine', 'formaggio'],
	'carne': ['pollo', 'hamburger', 'bacon', 'salame', 'crudo', 'cotto', 'wurstel', 'pulled pork'],
	'formaggio': ['cheddar', 'brie', 'scamorza', 'fontina', 'caprino', 'mozzarella', 'gorgonzola'],
	'fritto': ['fritte', 'fritti', 'nuggets', 'stick', 'anelli', 'polpette'],
	
	// Dietetici
	'analcolico': ['analcolica', 'senza alcool', 'virgin', '0%', 'zero alcohol'],
	'senza glutine': ['gluten free', 'celiaco', 'senza glutine'],
	'senza lattosio': ['lactose free', 'senza lattosio'],
};

// ============================================
// PAROLE CHE RICHIEDONO MATCH ESATTO (word boundary)
// Evita che "gin" matchi "ginger", "rum" matchi "drumstick", etc.
// ============================================
const EXACT_MATCH_WORDS = new Set([
	'gin', 'rum', 'rye', 'ipa', 'ale', 'bock', 'pils', 
	'the', 'tea', 'miele', 'sale', 'rosa', 'lime',
	'sec', 'dry', 'soda', 'cola', 'beer', 'vino'
]);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Normalizza testo per comparazione
 * - lowercase
 * - rimuove accenti
 * - normalizza apostrofi
 */
function normalizeText(text) {
	if (!text) return '';
	return text.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // rimuove accenti
		.replace(/[''`]/g, "'")
		.trim();
}

/**
 * Escape caratteri speciali regex
 */
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Verifica match con word boundary (parola intera)
 */
function matchesExactWord(text, word) {
	const escaped = escapeRegex(word);
	// \b non funziona bene con caratteri accentati, uso lookahead/lookbehind
	const regex = new RegExp(`(?:^|[\\s,;.!?()\\[\\]{}'"/-])${escaped}(?:[\\s,;.!?()\\[\\]{}'"/-]|$)`, 'i');
	return regex.test(` ${text} `); // padding per match ai bordi
}

/**
 * Verifica match fuzzy (contiene)
 */
function matchesFuzzy(text, word) {
	return normalizeText(text).includes(normalizeText(word));
}

/**
 * Espande query con sinonimi
 * @returns {string[]} Array di termini da cercare
 */
function expandQueryWithSynonyms(query) {
	const normalized = normalizeText(query);
	const tokens = new Set([normalized]);
	
	// Cerca match esatti nei sinonimi
	for (const [key, synonyms] of Object.entries(SYNONYMS)) {
		const keyNorm = normalizeText(key);
		
		// Se la query corrisponde alla chiave
		if (keyNorm === normalized) {
			synonyms.forEach(s => tokens.add(normalizeText(s)));
		}
		
		// Se la query corrisponde a un sinonimo
		for (const syn of synonyms) {
			if (normalizeText(syn) === normalized) {
				tokens.add(keyNorm);
				synonyms.forEach(s => tokens.add(normalizeText(s)));
				break;
			}
		}
	}
	
	return Array.from(tokens);
}

/**
 * Verifica se un termine richiede match esatto
 */
function requiresExactMatch(term) {
	const normalized = normalizeText(term);
	// Parole corte (<=3 char) o nella lista richiedono match esatto
	return normalized.length <= 3 || EXACT_MATCH_WORDS.has(normalized);
}

// ============================================
// MAIN SEARCH FUNCTION
// ============================================

/**
 * Ricerca intelligente nel menu
 * 
 * @param {Array} items - Array di items del menu
 * @param {string} query - Termine di ricerca
 * @returns {Array} Items filtrati e ordinati per rilevanza
 * 
 * @example
 * // "gin" → trova GIN TONIC, NEGRONI ma NON Ginger Beer
 * // "zenzero" → trova GINGER BEER, cocktail con ginger
 * // "speziato" → trova items con paprika, pepe, curry...
 */
export function smartSearch(items, query) {
	if (!query || query.trim() === '') {
		return items;
	}
	
	const queryNorm = normalizeText(query.trim());
	const searchTokens = expandQueryWithSynonyms(queryNorm);
	const queryNeedsExact = requiresExactMatch(queryNorm);
	
	const results = [];
	
	for (const item of items) {
		const nameNorm = normalizeText(item.name || '');
		const descNorm = normalizeText(item.description || '');
		const subcatNorm = normalizeText(item.subcategory || '');
		const detailedNorm = normalizeText(item.detailed_description || '');
		
		let score = 0;
		let matchedTokens = [];
		
		for (const token of searchTokens) {
			const tokenNeedsExact = requiresExactMatch(token);
			const isOriginalQuery = token === queryNorm;
			
			// Determina il tipo di match da usare
			const useExactMatch = isOriginalQuery && queryNeedsExact && tokenNeedsExact;
			
			// ---- MATCH NEL NOME (score più alto) ----
			if (useExactMatch) {
				if (matchesExactWord(nameNorm, token)) {
					score += 100;
					matchedTokens.push({ token, field: 'name', type: 'exact' });
				}
			} else {
				if (matchesFuzzy(nameNorm, token)) {
					score += 80;
					matchedTokens.push({ token, field: 'name', type: 'fuzzy' });
				}
			}
			
			// ---- MATCH NELLA DESCRIZIONE ----
			if (useExactMatch) {
				if (matchesExactWord(descNorm, token)) {
					score += 50;
					matchedTokens.push({ token, field: 'description', type: 'exact' });
				}
			} else {
				if (matchesFuzzy(descNorm, token)) {
					score += 40;
					matchedTokens.push({ token, field: 'description', type: 'fuzzy' });
				}
			}
			
			// ---- MATCH NELLA SOTTOCATEGORIA ----
			if (matchesFuzzy(subcatNorm, token)) {
				score += 30;
				matchedTokens.push({ token, field: 'subcategory', type: 'fuzzy' });
			}
			
			// ---- MATCH NELLA DESCRIZIONE DETTAGLIATA ----
			if (detailedNorm && matchesFuzzy(detailedNorm, token)) {
				score += 20;
				matchedTokens.push({ token, field: 'detailed_description', type: 'fuzzy' });
			}
		}
		
		// Includi solo se ha trovato almeno un match
		if (matchedTokens.length > 0) {
			// Bonus se il match è nel termine originale della query
			const hasOriginalMatch = matchedTokens.some(m => 
				m.token === queryNorm || 
				searchTokens.indexOf(m.token) === 0
			);
			if (hasOriginalMatch) {
				score += 25;
			}
			
			results.push({
				item,
				score,
				matchedTokens
			});
		}
	}
	
	// Ordina per score decrescente
	results.sort((a, b) => b.score - a.score);
	
	// Ritorna solo gli items
	return results.map(r => r.item);
}

/**
 * Debug: mostra dettagli del matching
 * Utile per testing
 */
export function smartSearchDebug(items, query) {
	if (!query || query.trim() === '') {
		return { results: items, debug: null };
	}
	
	const queryNorm = normalizeText(query.trim());
	const searchTokens = expandQueryWithSynonyms(queryNorm);
	
	const results = smartSearch(items, query);
	
	return {
		results,
		debug: {
			originalQuery: query,
			normalizedQuery: queryNorm,
			expandedTokens: searchTokens,
			resultCount: results.length
		}
	};
}

