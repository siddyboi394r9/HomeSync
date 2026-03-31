import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // This can be ignored if the middleware is handling it
            }
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      // Pass the specific Supabase error back to the login page
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Success! Redirect home.
    return NextResponse.redirect(`${origin}/`);

  } catch (err) {
    // Catch-all for server crashes (e.g. missing env vars, malformed URL, network timeout)
    console.error('Auth Callback Error:', err);
    
    // Attempt to parse origin safely, fallback to explicit path if it fails
    let safeOrigin = '';
    try {
      safeOrigin = new URL(request.url).origin;
    } catch (e) {
      safeOrigin = ''; // Defaulting to relative path
    }
    
    return NextResponse.redirect(`${safeOrigin}/login?error=${encodeURIComponent(err.message || 'Server Crash')}`);
  }
}
