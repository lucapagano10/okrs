import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to the main page after successful sign-in
        window.location.href = '/okrs/';
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
};
