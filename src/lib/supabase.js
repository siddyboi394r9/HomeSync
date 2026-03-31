import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// If vars are missing (like during a local build or pre-rendering), we return a dummy client or handle it to avoid crashing the build worker.
// Create a resilient client using a Proxy to handle missing env vars gracefully
const createResilientClient = () => {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  // Fallback no-op proxy to prevent crashes during builds or missing env vars
  const noop = () => ({ 
    data: null, 
    error: null, 
    select: noop, 
    insert: noop, 
    update: noop, 
    delete: noop, 
    eq: noop, 
    single: noop,
    on: noop,
    subscribe: noop,
    unsubscribe: noop
  });

  const authNoop = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ error: null })
  };

  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'auth') return authNoop;
      if (prop === 'from') return noop;
      if (prop === 'channel') return noop;
      return noop;
    }
  });
};

export const supabase = createResilientClient();
