import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = 'https://rpcyifexjaqkpiborcio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwY3lpZmV4amFxa3BpYm9yY2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzQ4OTMsImV4cCI6MjA3OTQxMDg5M30.30M8m2PTHbl988_U_bom1SMa1HgvENdJDTdX_ER6D6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: browser,
		autoRefreshToken: browser,
	}
});

