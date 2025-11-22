import { createClient } from "@supabase/supabase-js";
import { B as BROWSER } from "./false.js";
import { p as public_env } from "./shared-server.js";
const browser = BROWSER;
const supabaseUrl = public_env.VITE_SUPABASE_URL || "https://rpcyifexjaqkpiborcio.supabase.co";
const supabaseAnonKey = public_env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwY3lpZmV4amFxa3BpYm9yY2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzQ4OTMsImV4cCI6MjA3OTQxMDg5M30.30M8m2PTHbl988_U_bom1SMa1HgvENdJDTdX_ER6D6E";
createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: browser,
    autoRefreshToken: browser
  }
});
