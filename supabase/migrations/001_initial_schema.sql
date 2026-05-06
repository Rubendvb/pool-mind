-- ============================================================
-- Pool Mind — Schema inicial
-- Cole no SQL Editor do Supabase e execute
-- ============================================================

-- Extensão para UUIDs automáticos
create extension if not exists "pgcrypto";

-- ============================================================
-- POOLS
-- ============================================================
create table public.pools (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  volume      integer not null check (volume > 0),  -- litros
  type        text not null check (type in ('vinil', 'fibra', 'alvenaria')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- MEASUREMENTS
-- ============================================================
create table public.measurements (
  id           uuid primary key default gen_random_uuid(),
  pool_id      uuid not null references public.pools(id) on delete cascade,
  ph           numeric(4,2) not null check (ph between 0 and 14),
  chlorine     numeric(5,2) not null check (chlorine >= 0),   -- mg/L
  alkalinity   integer not null check (alkalinity >= 0),      -- mg/L
  hardness     integer not null check (hardness >= 0),        -- mg/L
  notes        text,
  image_url    text,
  measured_at  timestamptz not null default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  category    text not null check (category in ('piscina', 'casa', 'jardim')),
  frequency   text not null check (frequency in ('diaria', 'semanal', 'quinzenal', 'mensal')),
  next_due    date not null,
  status      text not null default 'pendente' check (status in ('pendente', 'concluida', 'atrasada')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.pools        enable row level security;
alter table public.measurements enable row level security;
alter table public.tasks        enable row level security;

-- Pools: usuário só acessa os próprios
create policy "pools_own" on public.pools
  using (auth.uid() = user_id);

create policy "pools_insert_own" on public.pools
  for insert with check (auth.uid() = user_id);

create policy "pools_update_own" on public.pools
  for update using (auth.uid() = user_id);

create policy "pools_delete_own" on public.pools
  for delete using (auth.uid() = user_id);

-- Measurements: acessa medições das suas piscinas
create policy "measurements_own" on public.measurements
  using (
    pool_id in (select id from public.pools where user_id = auth.uid())
  );

create policy "measurements_insert_own" on public.measurements
  for insert with check (
    pool_id in (select id from public.pools where user_id = auth.uid())
  );

create policy "measurements_delete_own" on public.measurements
  for delete using (
    pool_id in (select id from public.pools where user_id = auth.uid())
  );

-- Tasks: usuário só acessa as próprias
create policy "tasks_own" on public.tasks
  using (auth.uid() = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index on public.measurements (pool_id, measured_at desc);
create index on public.tasks (user_id, next_due asc);
create index on public.pools (user_id);

-- ============================================================
-- FUNÇÃO: recalcular next_due ao concluir uma tarefa
-- ============================================================
create or replace function public.advance_task_due()
returns trigger language plpgsql as $$
begin
  if new.status = 'concluida' then
    new.next_due := case new.frequency
      when 'diaria'     then current_date + interval '1 day'
      when 'semanal'    then current_date + interval '7 days'
      when 'quinzenal'  then current_date + interval '15 days'
      when 'mensal'     then current_date + interval '1 month'
    end;
    new.status := 'pendente';
  end if;
  return new;
end;
$$;

create trigger trg_advance_task_due
  before update on public.tasks
  for each row execute function public.advance_task_due();
