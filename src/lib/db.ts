import { createClient } from '@supabase/supabase-js';

// Use `NEXT_PUBLIC_` prefix for client-side variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!; // Corrected key reference

export const supabase = createClient(supabaseUrl, supabaseKey);
