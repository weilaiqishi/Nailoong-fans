// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Sticker } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn("Supabase URL and anon key are not configured. Please update your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
