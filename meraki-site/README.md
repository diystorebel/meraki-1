# Meraki - Sito Web

Sito web moderno per il bar Meraki di Lainate con Dashboard Admin.

## Tecnologie

- **Svelte/SvelteKit** - Framework UI veloce e leggero
- **Vite** - Build tool
- **LocalStorage** - Persistenza dati menu
- Design: Bianco + Verde #154315

## Struttura

```
src/
├── routes/
│   ├── +page.svelte          # Home: Hero, Chi siamo, Contatti, Orari
│   ├── menu/
│   │   └── +page.svelte      # Menu con filtri + modal dettagli prodotto
│   ├── admin/
│   │   └── +page.svelte      # Dashboard admin (password: 1234)
│   ├── privacy-policy/
│   └── cookie-policy/
├── lib/
│   ├── data/
│   │   └── menu.js           # Dati iniziali del menu (175 prodotti)
│   └── stores/
│       ├── menuStore.js      # Store Svelte per gestione menu
│       └── authStore.js      # Autenticazione admin
├── app.css                   # Stili globali
└── app.html                  # Template HTML
```

## Features

✅ **SplashScreen** - Animazione fade-out automatica dopo 3 secondi  
✅ **Home** - Hero fullscreen, sezioni Chi siamo, Contatti, Orari, Footer  
✅ **Menu** - Filtri funzionanti per categoria e sottocategoria  
✅ **Search** - Ricerca in tempo reale su nome e descrizione  
✅ **Responsive** - Design ottimizzato mobile-first  
✅ **Dati Reali** - Nessun dato simulato, tutti i 175 prodotti del menu reale  
✅ **Admin Dashboard** - Gestione completa del menu  
✅ **Prodotti con Click** - Modal con foto e descrizione dettagliata  
✅ **Upload Foto** - Caricamento immagini per prodotti (base64)  

## Admin Dashboard

### Accesso
- URL: `/admin`
- Password: `1234`

### Funzionalità

#### 🍸 Gestione Prodotti
- **CRUD completo**: Aggiungi, modifica, elimina prodotti
- **Categorie e sottocategorie** dinamiche
- **Prezzi**: Singolo o multiple taglie/formati
- **Note** per allergeni o info extra

#### 📸 Prodotti con Click
- **Toggle "Con Click"**: Attiva visualizzazione dettagliata
- **Descrizione dettagliata**: Testo esteso per modal
- **Upload foto**: Caricamento immagini prodotto
- **Modal interattiva**: Clic sul prodotto → visualizzazione fullscreen con foto

#### 🔍 Filtri e Ricerca
- Ricerca per nome prodotto
- Filtro per categoria
- Tabella con 175+ prodotti
- Badge visivi per prodotti con click/foto

### Workflow Prodotto con Click

1. **Admin**: Modifica prodotto → Attiva "Con Click"
2. **Admin**: Inserisce descrizione dettagliata + upload foto
3. **Menu**: Prodotto mostra icona 👁️
4. **Cliente**: Clic sul prodotto → Modal con foto + descrizione completa  

## Comandi

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview
```

## Persistenza Dati

- **LocalStorage**: Le modifiche al menu vengono salvate automaticamente
- **SessionStorage**: Autenticazione admin (reset al refresh)
- **Reset**: Possibilità di ripristinare menu originale (da implementare se necessario)

## Categorie Menu

- **Cocktails**: Speciali, Pre-Dinner, Esotici, After-Dinner, Analcolici
- **Spirits**: Gin Tonic (22 varietà), Whisky & Bourbon, Rum, Amari
- **Birre**: Alla Spina, In Bottiglia
- **Vini**: Bollicine, Bianchi, Rossi
- **Food**: Peccati di Gola, Panini, Hamburger, Dolci
- **Soft Drinks**

## Sicurezza

⚠️ **Nota**: Il sistema di autenticazione è base (password in chiaro nel codice).  
Per produzione, implementare:
- Backend con API
- JWT o sessioni server-side
- Password hashate
- Database reale (PostgreSQL/MongoDB)

## Contatti

Via Re Umberto I°, 36A - 20045 Lainate (MI)  
Tel: +39 351 6327144
