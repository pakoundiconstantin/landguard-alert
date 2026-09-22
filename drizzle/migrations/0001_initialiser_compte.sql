create or replace function public.initialiser_compte(
  _nom_complet text,
  _fonction text default null,
  _prefecture text default null,
  _role public.app_role default 'consultation'
)
returns public.app_role
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _role_final public.app_role;
begin
  if _uid is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  insert into public.profiles (id, nom_complet, email, fonction, prefecture)
  values (_uid, _nom_complet, (select email from auth.users where id = _uid), _fonction, _prefecture)
  on conflict (id) do update
    set nom_complet = excluded.nom_complet,
        fonction = excluded.fonction,
        prefecture = excluded.prefecture;

  if exists (select 1 from public.user_roles where user_id = _uid) then
    select role into _role_final from public.user_roles where user_id = _uid limit 1;
    return _role_final;
  end if;

  -- Le rôle administrateur n'est auto-attribué qu'au tout premier compte (amorçage).
  if _role = 'administrateur'
     and exists (select 1 from public.user_roles where role = 'administrateur') then
    _role_final := 'consultation';
  else
    _role_final := _role;
  end if;

  insert into public.user_roles (user_id, role) values (_uid, _role_final);
  return _role_final;
end;
$$;

revoke all on function public.initialiser_compte(text, text, text, public.app_role) from public, anon;
grant execute on function public.initialiser_compte(text, text, text, public.app_role) to authenticated;