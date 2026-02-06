import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

/**
 * Endpoint per eliminare automaticamente le candidature più vecchie di 7 giorni
 * Chiamato automaticamente da Vercel Cron ogni giorno
 */
export async function GET({ request }) {
	try {
		// Verifica che la richiesta venga da Vercel Cron (opzionale ma consigliato)
		const authHeader = request.headers.get('authorization');
		const cronSecret = import.meta.env.VERCEL_CRON_SECRET;
		
		if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Calcola la data di 7 giorni fa
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const cutoffDate = sevenDaysAgo.toISOString();

		console.log(`[Cleanup] Eliminazione candidature precedenti al: ${cutoffDate}`);

		// Elimina le candidature più vecchie di 7 giorni
		const { data, error } = await supabase
			.from('candidature')
			.delete()
			.lt('created_at', cutoffDate)
			.select();

		if (error) {
			console.error('Errore eliminazione candidature:', error);
			return json({ 
				error: 'Errore eliminazione candidature',
				details: error.message 
			}, { status: 500 });
		}

		const deletedCount = data?.length || 0;

		console.log(`[Cleanup] Eliminate ${deletedCount} candidature vecchie di 7 giorni`);

		return json({ 
			success: true,
			deletedCount,
			cutoffDate,
			message: `Eliminate ${deletedCount} candidature`
		});

	} catch (error) {
		console.error('Errore cleanup candidature:', error);
		return json({ 
			error: 'Errore interno del server',
			details: error.message 
		}, { status: 500 });
	}
}
