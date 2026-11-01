// Supabase client. Returns null when the env vars are not set, so the app still
// runs (without sign-in or sync) in local development. See SETUP_SUPABASE.md.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const authEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = authEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        // On web, finish the Google redirect by reading the session from the URL.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
