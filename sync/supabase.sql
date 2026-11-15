-- Infectio: synchronizacja postępu kodem. Wklej w Supabase → SQL Editor → Run.
-- Tabela jest zamknięta dla klucza publicznego; dostęp tylko przez dwie funkcje,
-- które wymagają znajomości skrótu kodu (64 znaki), więc nie da się wylistować cudzych danych.
create table if not exists infectio_progress (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table infectio_progress enable row level security;
revoke all on infectio_progress from anon, authenticated;

create or replace function get_progress(p_id text) returns jsonb
language sql security definer set search_path = public as $$
  select data from infectio_progress where id = p_id
$$;

create or replace function put_progress(p_id text, p_data jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_id !~ '^[0-9a-f]{64}$' then raise exception 'bad id'; end if;
  if pg_column_size(p_data) > 200000 then raise exception 'too large'; end if;
  insert into infectio_progress (id, data) values (p_id, p_data)
  on conflict (id) do update set data = excluded.data, updated_at = now();
end $$;

grant execute on function get_progress(text), put_progress(text, jsonb) to anon;
