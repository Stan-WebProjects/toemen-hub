import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ugnofmpeovnvwiaqapee.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbm9mbXBlb3ZudndpYXFhcGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjY3MTcsImV4cCI6MjA4OTUwMjcxN30.9OkjJO1k0JnkdNhse0Ss5_9WQknVIWpOnzZbBAVIo5c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export const TENANT_ID = 'toemen';
