const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function pingSupabase() {
  try {
    console.log('Pinging Supabase database...');
    
    // A simple query to keep the database active
    // This makes a lightweight call to fetch the system timestamp
    const { data, error } = await supabase.rpc('get_timestamp');
    
    if (error) {
      console.error('Error pinging Supabase:', error);
      process.exit(1);
    }
    
    console.log('Ping successful at:', data);
    console.log('Database will remain active for another 7 days');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the ping function
pingSupabase();