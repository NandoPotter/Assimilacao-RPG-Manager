create sequence "public"."characteristics_id_seq";

create sequence "public"."starting_kits_id_seq";


  create table "public"."character_inventory" (
    "id" uuid not null default gen_random_uuid(),
    "character_id" uuid not null,
    "item_id" text not null,
    "quantity" integer default 1,
    "notes" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "location" text default 'BACKPACK'::text,
    "is_dropped" boolean default false,
    "is_visible" boolean default true
      );


alter table "public"."character_inventory" enable row level security;


  create table "public"."characteristics" (
    "id" integer not null default nextval('public.characteristics_id_seq'::regclass),
    "campaign_id" integer default 1,
    "name" text not null,
    "description" text,
    "cost" integer not null,
    "requirements" jsonb default '[]'::jsonb,
    "req_label" text
      );


alter table "public"."characteristics" enable row level security;


  create table "public"."characters" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "campaign_id" integer default 1,
    "name" text not null,
    "avatar_url" text,
    "generation" text,
    "status" text default 'Em Cria????o'::text,
    "is_draft" boolean default false,
    "background" jsonb default '{}'::jsonb,
    "instincts" jsonb default '{}'::jsonb,
    "aptitudes" jsonb default '{}'::jsonb,
    "base_aptitudes" jsonb default '{}'::jsonb,
    "vitals" jsonb default '{}'::jsonb,
    "xp_available" integer default 0,
    "kit_name" text,
    "characteristics_ids" integer[],
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."characters" enable row level security;


  create table "public"."items" (
    "id" text not null,
    "name" text not null,
    "description" text,
    "slots" numeric(3,1) default 1.0,
    "category" text,
    "traits" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."items" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "role" text default 'infectado'::text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."starting_kits" (
    "id" integer not null default nextval('public.starting_kits_id_seq'::regclass),
    "campaign_id" integer default 1,
    "name" text not null,
    "items_description" text,
    "items_list" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."starting_kits" enable row level security;

alter sequence "public"."characteristics_id_seq" owned by "public"."characteristics"."id";

alter sequence "public"."starting_kits_id_seq" owned by "public"."starting_kits"."id";

CREATE UNIQUE INDEX character_inventory_pkey ON public.character_inventory USING btree (id);

CREATE UNIQUE INDEX characteristics_pkey ON public.characteristics USING btree (id);

CREATE UNIQUE INDEX characters_pkey ON public.characters USING btree (id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX starting_kits_pkey ON public.starting_kits USING btree (id);

alter table "public"."character_inventory" add constraint "character_inventory_pkey" PRIMARY KEY using index "character_inventory_pkey";

alter table "public"."characteristics" add constraint "characteristics_pkey" PRIMARY KEY using index "characteristics_pkey";

alter table "public"."characters" add constraint "characters_pkey" PRIMARY KEY using index "characters_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."starting_kits" add constraint "starting_kits_pkey" PRIMARY KEY using index "starting_kits_pkey";

alter table "public"."character_inventory" add constraint "character_inventory_character_id_fkey" FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE not valid;

alter table "public"."character_inventory" validate constraint "character_inventory_character_id_fkey";

alter table "public"."character_inventory" add constraint "character_inventory_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.items(id) not valid;

alter table "public"."character_inventory" validate constraint "character_inventory_item_id_fkey";

alter table "public"."character_inventory" add constraint "check_inventory_location" CHECK ((location = ANY (ARRAY['EQUIPPED'::text, 'BACKPACK'::text, 'REFUGE'::text]))) not valid;

alter table "public"."character_inventory" validate constraint "check_inventory_location";

alter table "public"."characters" add constraint "characters_generation_check" CHECK ((generation = ANY (ARRAY['Pr??-Colapso'::text, 'Colapso'::text, 'P??s-Colapso'::text]))) not valid;

alter table "public"."characters" validate constraint "characters_generation_check";

alter table "public"."characters" add constraint "characters_status_check" CHECK ((status = ANY (ARRAY['Saud??vel'::text, 'Escoriado'::text, 'Lacerado'::text, 'Ferido'::text, 'Debilitado'::text, 'Incapacitado'::text, 'Morto'::text, 'Em Cria????o'::text]))) not valid;

alter table "public"."characters" validate constraint "characters_status_check";

alter table "public"."characters" add constraint "characters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."characters" validate constraint "characters_user_id_fkey";

alter table "public"."items" add constraint "items_category_check" CHECK ((category = ANY (ARRAY['consumable'::text, 'equipment'::text, 'weapon'::text, 'backpack'::text]))) not valid;

alter table "public"."items" validate constraint "items_category_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id, 
    -- Pega o nome enviado pelo authService, ou usa o come??o do email se falhar
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'infectado'
  );
  RETURN new;
END;
$function$
;

grant delete on table "public"."character_inventory" to "anon";

grant insert on table "public"."character_inventory" to "anon";

grant references on table "public"."character_inventory" to "anon";

grant select on table "public"."character_inventory" to "anon";

grant trigger on table "public"."character_inventory" to "anon";

grant truncate on table "public"."character_inventory" to "anon";

grant update on table "public"."character_inventory" to "anon";

grant delete on table "public"."character_inventory" to "authenticated";

grant insert on table "public"."character_inventory" to "authenticated";

grant references on table "public"."character_inventory" to "authenticated";

grant select on table "public"."character_inventory" to "authenticated";

grant trigger on table "public"."character_inventory" to "authenticated";

grant truncate on table "public"."character_inventory" to "authenticated";

grant update on table "public"."character_inventory" to "authenticated";

grant delete on table "public"."character_inventory" to "postgres";

grant insert on table "public"."character_inventory" to "postgres";

grant references on table "public"."character_inventory" to "postgres";

grant select on table "public"."character_inventory" to "postgres";

grant trigger on table "public"."character_inventory" to "postgres";

grant truncate on table "public"."character_inventory" to "postgres";

grant update on table "public"."character_inventory" to "postgres";

grant delete on table "public"."character_inventory" to "service_role";

grant insert on table "public"."character_inventory" to "service_role";

grant references on table "public"."character_inventory" to "service_role";

grant select on table "public"."character_inventory" to "service_role";

grant trigger on table "public"."character_inventory" to "service_role";

grant truncate on table "public"."character_inventory" to "service_role";

grant update on table "public"."character_inventory" to "service_role";

grant delete on table "public"."characteristics" to "anon";

grant insert on table "public"."characteristics" to "anon";

grant references on table "public"."characteristics" to "anon";

grant select on table "public"."characteristics" to "anon";

grant trigger on table "public"."characteristics" to "anon";

grant truncate on table "public"."characteristics" to "anon";

grant update on table "public"."characteristics" to "anon";

grant delete on table "public"."characteristics" to "authenticated";

grant insert on table "public"."characteristics" to "authenticated";

grant references on table "public"."characteristics" to "authenticated";

grant select on table "public"."characteristics" to "authenticated";

grant trigger on table "public"."characteristics" to "authenticated";

grant truncate on table "public"."characteristics" to "authenticated";

grant update on table "public"."characteristics" to "authenticated";

grant delete on table "public"."characteristics" to "postgres";

grant insert on table "public"."characteristics" to "postgres";

grant references on table "public"."characteristics" to "postgres";

grant select on table "public"."characteristics" to "postgres";

grant trigger on table "public"."characteristics" to "postgres";

grant truncate on table "public"."characteristics" to "postgres";

grant update on table "public"."characteristics" to "postgres";

grant delete on table "public"."characteristics" to "service_role";

grant insert on table "public"."characteristics" to "service_role";

grant references on table "public"."characteristics" to "service_role";

grant select on table "public"."characteristics" to "service_role";

grant trigger on table "public"."characteristics" to "service_role";

grant truncate on table "public"."characteristics" to "service_role";

grant update on table "public"."characteristics" to "service_role";

grant delete on table "public"."characters" to "anon";

grant insert on table "public"."characters" to "anon";

grant references on table "public"."characters" to "anon";

grant select on table "public"."characters" to "anon";

grant trigger on table "public"."characters" to "anon";

grant truncate on table "public"."characters" to "anon";

grant update on table "public"."characters" to "anon";

grant delete on table "public"."characters" to "authenticated";

grant insert on table "public"."characters" to "authenticated";

grant references on table "public"."characters" to "authenticated";

grant select on table "public"."characters" to "authenticated";

grant trigger on table "public"."characters" to "authenticated";

grant truncate on table "public"."characters" to "authenticated";

grant update on table "public"."characters" to "authenticated";

grant delete on table "public"."characters" to "postgres";

grant insert on table "public"."characters" to "postgres";

grant references on table "public"."characters" to "postgres";

grant select on table "public"."characters" to "postgres";

grant trigger on table "public"."characters" to "postgres";

grant truncate on table "public"."characters" to "postgres";

grant update on table "public"."characters" to "postgres";

grant delete on table "public"."characters" to "service_role";

grant insert on table "public"."characters" to "service_role";

grant references on table "public"."characters" to "service_role";

grant select on table "public"."characters" to "service_role";

grant trigger on table "public"."characters" to "service_role";

grant truncate on table "public"."characters" to "service_role";

grant update on table "public"."characters" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "postgres";

grant insert on table "public"."items" to "postgres";

grant references on table "public"."items" to "postgres";

grant select on table "public"."items" to "postgres";

grant trigger on table "public"."items" to "postgres";

grant truncate on table "public"."items" to "postgres";

grant update on table "public"."items" to "postgres";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."starting_kits" to "anon";

grant insert on table "public"."starting_kits" to "anon";

grant references on table "public"."starting_kits" to "anon";

grant select on table "public"."starting_kits" to "anon";

grant trigger on table "public"."starting_kits" to "anon";

grant truncate on table "public"."starting_kits" to "anon";

grant update on table "public"."starting_kits" to "anon";

grant delete on table "public"."starting_kits" to "authenticated";

grant insert on table "public"."starting_kits" to "authenticated";

grant references on table "public"."starting_kits" to "authenticated";

grant select on table "public"."starting_kits" to "authenticated";

grant trigger on table "public"."starting_kits" to "authenticated";

grant truncate on table "public"."starting_kits" to "authenticated";

grant update on table "public"."starting_kits" to "authenticated";

grant delete on table "public"."starting_kits" to "postgres";

grant insert on table "public"."starting_kits" to "postgres";

grant references on table "public"."starting_kits" to "postgres";

grant select on table "public"."starting_kits" to "postgres";

grant trigger on table "public"."starting_kits" to "postgres";

grant truncate on table "public"."starting_kits" to "postgres";

grant update on table "public"."starting_kits" to "postgres";

grant delete on table "public"."starting_kits" to "service_role";

grant insert on table "public"."starting_kits" to "service_role";

grant references on table "public"."starting_kits" to "service_role";

grant select on table "public"."starting_kits" to "service_role";

grant trigger on table "public"."starting_kits" to "service_role";

grant truncate on table "public"."starting_kits" to "service_role";

grant update on table "public"."starting_kits" to "service_role";


  create policy "Gerenciar invent??rio pr??prio"
  on "public"."character_inventory"
  as permissive
  for all
  to authenticated
using ((character_id IN ( SELECT characters.id
   FROM public.characters
  WHERE (characters.user_id = auth.uid()))))
with check ((character_id IN ( SELECT characters.id
   FROM public.characters
  WHERE (characters.user_id = auth.uid()))));



  create policy "Ler caracter??sticas"
  on "public"."characteristics"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Gerenciar pr??prios personagens"
  on "public"."characters"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Ler itens"
  on "public"."items"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Permitir Criar"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id));



  create policy "Permitir Leitura"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));



  create policy "Permitir Update"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Ler kits"
  on "public"."starting_kits"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Delete Own Avatar 1kbqpp2_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'character-avatars'::text));



  create policy "Delete Own Avatar 1kbqpp2_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'character-avatars'::text));



  create policy "Update Own Avatar 1kbqpp2_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'character-avatars'::text));



  create policy "Update Own Avatar 1kbqpp2_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'character-avatars'::text));



  create policy "Upload Avatar 1kbqpp2_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'character-avatars'::text));




