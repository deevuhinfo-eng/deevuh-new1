import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const anonClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL, codeChallenge: challenge, codeChallengeMethod: 'S256' } });
const { data: sessionData } = await anonClient.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
const s = sessionData?.session;
if (!s) { console.error('NO SESSION'); process.exit(1); }
const cookieName = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
const payload = JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at, user: s.user });
const b64 = Buffer.from(payload).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
console.log(cookieName);
console.log('base64-' + b64);
