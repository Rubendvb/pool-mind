-- Adiciona suporte a tarefas de execução única ('unica')

-- 1. Expande o CHECK constraint de frequência
alter table public.tasks
  drop constraint if exists tasks_frequency_check;

alter table public.tasks
  add constraint tasks_frequency_check
    check (frequency in ('diaria', 'semanal', 'quinzenal', 'mensal', 'unica'));

-- 2. Atualiza o trigger: tarefas 'unica' permanecem como 'concluida' ao invés de serem recicladas
create or replace function public.advance_task_due()
returns trigger language plpgsql as $$
begin
  if new.status = 'concluida' and new.frequency <> 'unica' then
    new.next_due := case new.frequency
      when 'diaria'    then current_date + interval '1 day'
      when 'semanal'   then current_date + interval '7 days'
      when 'quinzenal' then current_date + interval '15 days'
      when 'mensal'    then current_date + interval '1 month'
    end;
    new.status := 'pendente';
  end if;
  return new;
end;
$$;
