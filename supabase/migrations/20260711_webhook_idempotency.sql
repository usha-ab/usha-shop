-- Webhook idempotency store for the Stripe → CJdropshipping fulfilment webhook.
-- Lives in the platform Supabase (the shop already reads profiles there via the
-- shared .usha.se session). Accessed only through the two SECURITY DEFINER
-- functions below, so the shop's anon client can claim/release without a
-- service-role key. Stripe event ids (evt_…) are unguessable, and the webhook
-- verifies the Stripe signature before claiming, so anon execute is safe.
-- Applied to project hiurrvorwqfihtdfhbhv.

create table if not exists public.shop_processed_stripe_events (
  event_id   text primary key,
  session_id text,
  created_at timestamptz not null default now()
);
alter table public.shop_processed_stripe_events enable row level security;
-- No RLS policies: direct table access is denied; only the functions below touch it.

create or replace function public.claim_stripe_event(p_event_id text, p_session_id text default null)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.shop_processed_stripe_events (event_id, session_id)
  values (p_event_id, p_session_id);
  return true;                       -- first time we've seen this event
exception when unique_violation then
  return false;                      -- already processed
end;
$$;

create or replace function public.release_stripe_event(p_event_id text)
returns void
language sql
security definer
set search_path to 'public'
as $$
  delete from public.shop_processed_stripe_events where event_id = p_event_id;
$$;

grant execute on function public.claim_stripe_event(text, text) to anon, authenticated, service_role;
grant execute on function public.release_stripe_event(text) to anon, authenticated, service_role;
