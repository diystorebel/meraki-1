import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const data = await request.json();
		const { nome, cognome, email, telefono, messaggio, cv_filename, cv_base64, cv_mimetype } = data;

		// Validazione dati
		if (!nome || !cognome || !email || !telefono || !messaggio || !cv_base64) {
			return json({ error: 'Dati mancanti' }, { status: 400 });
		}

		// Prepara email HTML
		const emailHTML = `
			<h2>Nuova Candidatura - Meraki Lainate</h2>
			<p><strong>Nome:</strong> ${nome}</p>
			<p><strong>Cognome:</strong> ${cognome}</p>
			<p><strong>Email:</strong> ${email}</p>
			<p><strong>Telefono:</strong> ${telefono}</p>
			<p><strong>Messaggio:</strong></p>
			<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
				${messaggio.replace(/\n/g, '<br>')}
			</div>
			<p><strong>CV allegato:</strong> ${cv_filename}</p>
			<hr>
			<p style="font-size: 12px; color: #666;">
				Candidatura ricevuta il ${new Date().toLocaleString('it-IT')}
			</p>
		`;

		// Prepara payload per servizio email (esempio con Resend)
		const emailPayload = {
			from: 'Meraki Candidature <noreply@merakilainate.it>',
			to: ['gmar.scio@gmail.com'], // TEST - poi sarà info@merakilainate.it
			subject: `Nuova Candidatura: ${nome} ${cognome}`,
			html: emailHTML,
			attachments: [
				{
					filename: cv_filename,
					content: cv_base64,
					type: cv_mimetype,
					disposition: 'attachment'
				}
			]
		};

		// Per ora simulo l'invio (sostituire con servizio email reale)
		console.log('Email payload preparato:', {
			to: emailPayload.to,
			subject: emailPayload.subject,
			attachmentName: cv_filename,
			attachmentSize: cv_base64.length
		});

		// TODO: Integrare servizio email reale (Resend, SendGrid, etc.)
		// const emailResponse = await fetch('https://api.resend.com/emails', {
		//   method: 'POST',
		//   headers: {
		//     'Authorization': `Bearer ${RESEND_API_KEY}`,
		//     'Content-Type': 'application/json'
		//   },
		//   body: JSON.stringify(emailPayload)
		// });

		// Simula successo per ora
		await new Promise(resolve => setTimeout(resolve, 1000));

		return json({ 
			success: true, 
			message: 'Candidatura inviata con successo' 
		});

	} catch (error) {
		console.error('Errore invio candidatura:', error);
		return json({ 
			error: 'Errore interno del server' 
		}, { status: 500 });
	}
}
