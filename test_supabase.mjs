import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ifufuwpwhnghlnjsnyjo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdWZ1d3B3aG5naGxuanNueWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjA5MTMsImV4cCI6MjA5MzEzNjkxM30.OMpd4oqF4PqsZ3LfmPtJjKkmSvSvd8ojcRtyTwfuc78";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing admins table...");
  const { error: adminError } = await supabase.from('admins').insert({ user_id: 'test-user-id' });
  console.log("Admin Insert Error:", adminError);

  console.log("Testing avatars bucket...");
  const { error: storageError } = await supabase.storage.from('avatars').upload('test.txt', 'test content');
  console.log("Storage Upload Error:", storageError);
}

run();
