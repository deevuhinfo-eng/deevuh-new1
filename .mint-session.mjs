import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
if (!email) { console.error('usage: mint-session <email>'); process.exit(1); }

const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');

const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const anonClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL, codeChallenge: challenge, codeChallengeMethod: 'S256' },
});
if (linkErr) { console.error('generateLink err:', linkErr.message); process.exit(1); }

const tokenHash = link?.properties?.hashed_token;
if (!tokenHash) { console.error('no hashed_token'); process.exit(1); }

const { data: sessionData, error: verifyErr } = await anonClient.auth.verifyOtp({
  type: 'magiclink',
  token_hash: tokenHash,
  options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL },
});
if (verifyErr || !sessionData?.session) { console.error('verifyOtp err:', verifyErr?.message); process.exit(1); }

const cookieName = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
console.log('REFR=app:', sessionData.session.user.app_metadata.refresh_token);
console.log('EMAIL:', sessionData.session.user.email);
console.log(JSON.stringify({ cookieName, cookieValue: encodeURIComponent(Buffer.from(JSON.stringify({ access_token: sessionData.session.access_token, refresh_token: sessionData.session.refresh_token, expires_at: sessionData.session.expires_at }), 'utf-8').toString('base64')) }));
const { data: userMeta } = await admin.auth.getUser(sessionData.session.user.id);