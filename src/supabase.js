import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH HELPERS ──────────────────────────────────────────────────

export async function signUp({ email, password, role, name, phone, whatsapp, sector, city, howHeard, category, experience, bio }) {
  const device = /Mobi/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, name, phone, whatsapp, sector, city, how_heard: howHeard, device, category, experience, bio }
    }
  });
  return { data, error };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── PROFILE HELPERS ───────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function getProviderProfile(userId) {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { data, error };
}

export async function updateProviderProfile(userId, updates) {
  const { data, error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', userId);
  return { data, error };
}

// ── PROVIDER BROWSE HELPERS ───────────────────────────────────────

export async function getAllProviders() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, account_no, name, sector, city, phone, whatsapp, banned,
      providers (
        category, experience, bio, verified, featured, featured_until,
        rating, review_count, job_count, lead_count, avatar
      )
    `)
    .eq('role', 'provider')
    .eq('banned', false);
  return { data, error };
}

// ── JOBS HELPERS ──────────────────────────────────────────────────

export async function postJob({ clientId, category, description, sector, city, budget, urgency, size, howHeard }) {
  const device = /Mobi/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ client_id: clientId, category, description, sector, city, budget, urgency, size, how_heard: howHeard, device }])
    .select()
    .single();
  return { data, error };
}

export async function getClientJobs(clientId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getProviderLeads(category) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`*, profiles(name)`)
    .eq('category', category)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return { data, error };
}

// ── ADMIN HELPERS ─────────────────────────────────────────────────

export async function adminGetAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`*, providers(*)`)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function adminBanUser(userId, banned) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ banned })
    .eq('id', userId);
  return { data, error };
}

export async function adminFeatureProvider(userId, featured) {
  const { data, error } = await supabase
    .from('providers')
    .update({ featured })
    .eq('id', userId);
  return { data, error };
}

export async function adminVerifyProvider(userId) {
  const { data, error } = await supabase
    .from('providers')
    .update({ verified: true })
    .eq('id', userId);
  // Also update the verification request
  await supabase
    .from('verifications')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('provider_id', userId)
    .eq('status', 'pending');
  return { data, error };
}

export async function adminUpdateProfile(userId, profileUpdates, providerUpdates) {
  const { error: pErr } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', userId);
  if (providerUpdates) {
    await supabase.from('providers').update(providerUpdates).eq('id', userId);
  }
  return { error: pErr };
}

export async function getPendingVerifications() {
  const { data, error } = await supabase
    .from('verifications')
    .select(`*, profiles(name, email, phone, sector, city), providers(category)`)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
  return { data, error };
}

// ── FEATURED REQUEST ──────────────────────────────────────────────

export async function submitFeaturedRequest(providerId, days, priceRd) {
  const { data, error } = await supabase
    .from('featured_requests')
    .insert([{ provider_id: providerId, days, price_rd: priceRd, status: 'pending' }])
    .select()
    .single();
  return { data, error };
}
