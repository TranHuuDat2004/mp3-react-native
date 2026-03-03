import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
// In a real app, use environment variables!
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
