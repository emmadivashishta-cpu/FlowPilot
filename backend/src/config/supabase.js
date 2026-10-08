const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase Config] WARNING: SUPABASE_URL or SUPABASE_KEY environment variables are missing.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-app.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false
    }
  }
);

module.exports = { supabase };
