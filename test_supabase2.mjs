import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ifufuwpwhnghlnjsnyjo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdWZ1d3B3aG5naGxuanNueWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjA5MTMsImV4cCI6MjA5MzEzNjkxM30.OMpd4oqF4PqsZ3LfmPtJjKkmSvSvd8ojcRtyTwfuc78";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
  const { data, error } = await supabase.from('admins').select('*');
  console.log("Admins Table Accessible?", error ? "No, error: " + error.message : "Yes");
}

checkPolicies();
