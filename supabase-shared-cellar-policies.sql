do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cellars'
      and policyname = 'Users can create their own cellar'
  ) then
    create policy "Users can create their own cellar"
    on cellars for insert
    with check (owner_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cellars'
      and policyname = 'Owners can update their cellar'
  ) then
    create policy "Owners can update their cellar"
    on cellars for update
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cellar_members'
      and policyname = 'Users can create their own cellar membership'
  ) then
    create policy "Users can create their own cellar membership"
    on cellar_members for insert
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cellar_members'
      and policyname = 'Users can delete their own cellar membership'
  ) then
    create policy "Users can delete their own cellar membership"
    on cellar_members for delete
    using (user_id = auth.uid());
  end if;
end $$;

create or replace function public.create_cellar_for_current_user(cellar_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_cellar_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select cellar_id
  into new_cellar_id
  from public.cellar_members
  where user_id = auth.uid()
  limit 1;

  if new_cellar_id is not null then
    return new_cellar_id;
  end if;

  insert into public.cellars (name, owner_id)
  values (coalesce(nullif(cellar_name, ''), 'My Cellar'), auth.uid())
  returning id into new_cellar_id;

  insert into public.cellar_members (cellar_id, user_id, role)
  values (new_cellar_id, auth.uid(), 'owner')
  on conflict (cellar_id, user_id) do nothing;

  return new_cellar_id;
end;
$$;

grant execute on function public.create_cellar_for_current_user(text) to authenticated;
