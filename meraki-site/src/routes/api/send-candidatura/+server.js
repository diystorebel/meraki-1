import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Configurazione destinatario email
// TODO: Cambiare con email ufficiale Meraki quando disponibile
const EMAIL_DESTINATARIO = 'gmar.scio@gmail.com';

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
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: #154315; color: white; padding: 20px; text-align: center;">
					<h2 style="margin: 0;">Nuova Candidatura - Meraki Lainate</h2>
				</div>
				<div style="padding: 20px; background: #f9f9f9;">
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Nome:</strong></td>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${nome}</td>
						</tr>
						<tr>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Cognome:</strong></td>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${cognome}</td>
						</tr>
						<tr>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
						</tr>
						<tr>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Telefono:</strong></td>
							<td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><a href="tel:${telefono}">${telefono}</a></td>
						</tr>
					</table>
					<div style="margin-top: 20px;">
						<strong>Messaggio:</strong>
						<div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #154315;">
							${messaggio.replace(/\n/g, '<br>')}
						</div>
					</div>
					<p style="margin-top: 20px; padding: 10px; background: #e8f5e9; border-radius: 5px;">
						📎 <strong>CV allegato:</strong> ${cv_filename}
					</p>
				</div>
				<div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
					Candidatura ricevuta il ${new Date().toLocaleString('it-IT')}<br>
					Questo messaggio è stato inviato automaticamente dal sito Meraki Lainate
				</div>
			</div>
		`;

		// Verifica API key configurata
		if (!env.RESEND_API_KEY) {
			console.error('RESEND_API_KEY non configurata');
			return json({ error: 'Servizio email non configurato' }, { status: 500 });
		}

		// Payload per Resend
		const emailPayload = {
			from: 'Meraki Candidature <onboarding@resend.dev>', // Dominio gratuito Resend
			to: [EMAIL_DESTINATARIO],
			reply_to: email, // Risposta diretta al candidato
			subject: `🧑‍💼 Nuova Candidatura: ${nome} ${cognome}`,
			html: emailHTML,
			attachments: [
				{
					filename: cv_filename,
					content: cv_base64 // Resend accetta base64 direttamente
				}
			]
		};

		// Invio email tramite Resend
		const emailResponse = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(emailPayload)
		});

		const emailResult = await emailResponse.json();

		if (!emailResponse.ok) {
			console.error('Errore Resend:', emailResult);
			return json({ 
				error: 'Errore invio email: ' + (emailResult.message || 'Errore sconosciuto')
			}, { status: 500 });
		}

		console.log('Email inviata con successo:', {
			id: emailResult.id,
			to: EMAIL_DESTINATARIO,
			subject: emailPayload.subject
		});

		return json({ 
			success: true, 
			message: 'Candidatura inviata con successo',
			emailId: emailResult.id
		});

	} catch (error) {
		console.error('Errore invio candidatura:', error);
		return json({ 
			error: 'Errore interno del server' 
		}, { status: 500 });
	}
}
