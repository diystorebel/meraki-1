# SEO Update - Pranzo/Lunch

**Data**: 2026-02-07  
**Stato**: ✅ Completato

## Problema identificato

Gli orari di apertura nel JSON-LD Schema.org erano completamente errati e mancava qualsiasi riferimento al servizio pranzo.

### Orari reali (dal database)
- **Lun-Ven**: 10:30-15:00 (pranzo) + 17:30-22:30 (sera)
- **Sabato**: 10:30-15:00 (pranzo) + 17:30-00:00 (sera)  
- **Domenica**: Solo sera 17:30-22:30

### Orari SEO vecchi (ERRATI)
- ❌ Lun-Gio-Dom: 18:00-01:00
- ❌ Ven-Sab: 18:00-02:00
- ❌ Nessun riferimento al pranzo

---

## Modifiche applicate

### 1. **`+layout.svelte`** - JSON-LD Schema.org

#### Meta description aggiornata
```javascript
const siteDescription = 'Cocktail bar a Lainate aperto anche a pranzo. Scopri i nostri cocktails artigianali, drinks, pranzo e food in un\'atmosfera unica. L\'essenza di noi stessi.';
```

#### openingHoursSpecification corretto
```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "10:30",
    "closes": "15:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "17:30",
    "closes": "22:30"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Saturday"],
    "opens": "17:30",
    "closes": "00:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday"],
    "opens": "17:30",
    "closes": "22:30"
  }
]
```

#### servesCuisine aggiornato
```json
"servesCuisine": ["Cocktails", "Drinks", "Pranzo", "Lunch", "Finger Food"]
```

#### Keywords arricchite
```html
<meta name="keywords" content="cocktail bar, bar lainate, aperitivo lainate, pranzo lainate, aperto pranzo, lunch bar, drinks, cocktails artigianali, nightlife milano, meraki" />
```

---

### 2. **`+page.svelte`** - Homepage SEO

#### Meta description
```html
<meta name="description" content="Cocktail bar a Lainate aperto anche a pranzo. Scopri i nostri cocktails artigianali, drinks, pranzo e food in un'atmosfera unica. L'essenza di noi stessi." />
```

#### Open Graph
```html
<meta property="og:description" content="Cocktail bar a Lainate aperto anche a pranzo. Scopri i nostri cocktails artigianali, drinks, pranzo e food." />
```

#### Twitter Card
```html
<meta name="twitter:description" content="Cocktail bar a Lainate aperto anche a pranzo. Scopri i nostri cocktails artigianali, drinks, pranzo e food." />
```

---

## Benefici SEO attesi

### 1. **Query Google target**
- "bar pranzo lainate"
- "dove pranzare lainate"
- "cocktail bar aperto pranzo"
- "lunch bar lainate"
- "aperitivo pranzo lainate"

### 2. **Rich Snippets Google**
- ✅ Gli orari corretti appariranno nel Knowledge Panel
- ✅ Google Maps mostrerà "Aperto a pranzo"
- ✅ Rich snippet con orari pranzo/sera separati

### 3. **Local SEO**
- Miglior posizionamento per ricerche locali "vicino a me"
- Maggiore visibilità nelle ore 10:30-15:00
- Differenziazione da competitor (pochi bar aperti a pranzo)

---

## Verifica e monitoring

### Tool di validazione
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitorare impressions per query "pranzo"

### KPI da tracciare
- Impressions query "pranzo lainate" (GSC)
- CTR da SERP ore 10:00-15:00
- Traffico organico segmento "lunch"
- Conversioni prenotazioni pranzo

---

## Note tecniche

**Fonte dati**: Database `orari_apertura` (tabella Supabase)  
**Sincronizzazione**: Gli orari SEO devono essere aggiornati manualmente se cambiano nel DB  
**TODO**: Implementare sincronizzazione automatica orari DB → JSON-LD (ticket futuro)

**Testing**:
```bash
# Validare JSON-LD
curl -s https://www.merakilainate.it/ | grep -A 50 "application/ld+json"
```

---

**Documentato da**: One2One Digital F&B  
**Commit**: Aggiornamento SEO orari e keyword pranzo
