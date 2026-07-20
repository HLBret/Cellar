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
