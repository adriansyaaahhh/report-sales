// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nslsiisupracuzuzteut.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbHNpaXN1cHJhY3V6dXp0ZXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDMxODYsImV4cCI6MjA2OTk3OTE4Nn0.oifO2_BmGmW2sjfyqAFVDeoQ5L-IosIqQSKqBmYORFA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
