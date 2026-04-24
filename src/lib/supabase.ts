import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Atlas GP] ⚠️ Supabase env vars not configured. Auth will not work.');
}

// Create a real client when env vars are present, otherwise create a no-op stub
// that won't throw when called (all methods return rejected promises)
let supabaseInstance: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // No-op stub for dev without Supabase configured
  // The DEV BYPASS in auth-store.ts handles auth when Supabase is unavailable
  const noopAuth = {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
    signUp: () => Promise.reject(new Error('Supabase not configured')),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.reject(new Error('Supabase not configured')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  supabaseInstance = {
    auth: noopAuth,
  } as unknown as SupabaseClient;
}

export const supabase = supabaseInstance;
