# Email Candidature - Setup

## Implementazione Completata

✅ **Pagina "Lavora con Noi"** - `/lavora-con-noi`
- Form completo: nome, cognome, email, telefono, messaggio
- Upload CV (PDF/immagini, max 5MB)  
- Checkbox consenso privacy
- Validazione client-side

✅ **Database**
- Tabella `candidature` creata
- Campi: nome, cognome, email, telefono, messaggio, cv_filename
- RLS policies configurate

✅ **API Route** - `/api/send-candidatura`
- Riceve dati form + CV in base64
- Prepara email HTML con allegato
- Salva record in DB

## TODO: Integrazione Email

**SERVIZIO CONSIGLIATO: Resend**
- Costo: ~$20/mese per 100k email
- API semplice, supporto allegati
- Domini custom supportati

### Setup Resend:

1. **Registrazione**: https://resend.com
2. **Verifica dominio**: `merakilainate.it`
3. **API Key**: aggiungi a `.env`
4. **Sostituisci in** `/api/send-candidatura/+server.js`:

```js
// Sostituire il TODO con:
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailPayload)
});
```

### Email di destinazione:
- **TEST**: `gmar.scio@gmail.com` 
- **PRODUZIONE**: `info@merakilainate.it`

## Struttura Email

**Subject**: `Nuova Candidatura: [Nome] [Cognome]`
**From**: `Meraki Candidature <noreply@merakilainate.it>`
**To**: `info@merakilainate.it`
**Allegato**: CV del candidato

## Test

1. Vai su `/lavora-con-noi`
2. Compila form e carica CV
3. Verifica email ricevuta con allegato
4. Controlla record in DB `candidature`
