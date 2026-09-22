-- ============ TYPES ============
CREATE TYPE public.app_role AS ENUM ('administrateur','cadastre','tribunal','consultation');
CREATE TYPE public.statut_parcelle AS ENUM ('actif','en_litige','decision_rendue','mis_a_jour','suspendu');
CREATE TYPE public.statut_plainte AS ENUM ('enregistree','en_examen','transformee_en_litige','rejetee','close');
CREATE TYPE public.statut_litige AS ENUM ('nouveau','en_cours','en_attente_decision','decide','resolu','cloture');
CREATE TYPE public.niveau_priorite AS ENUM ('faible','moyen','eleve','critique');

-- ============ PROFILS ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nom_complet text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  fonction text,
  prefecture text,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.est_actif(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT actif FROM public.profiles WHERE id = _user_id), false);
$$;

-- ============ PARCELLES ============
CREATE TABLE public.parcelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_parcelle text NOT NULL UNIQUE,
  reference_cadastrale text NOT NULL,
  prefecture text NOT NULL,
  commune text NOT NULL,
  localite text,
  superficie_m2 numeric NOT NULL DEFAULT 0,
  proprietaire text,
  type_titre text,
  statut public.statut_parcelle NOT NULL DEFAULT 'actif',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  geometrie jsonb,
  observations text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcelles TO authenticated;
GRANT ALL ON public.parcelles TO service_role;
ALTER TABLE public.parcelles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.plaintes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  parcelle_id uuid NOT NULL REFERENCES public.parcelles(id) ON DELETE CASCADE,
  plaignant text NOT NULL,
  partie_adverse text,
  motif text NOT NULL,
  description text,
  piece_jointe_url text,
  date_depot date NOT NULL DEFAULT CURRENT_DATE,
  statut public.statut_plainte NOT NULL DEFAULT 'enregistree',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plaintes TO authenticated;
GRANT ALL ON public.plaintes TO service_role;
ALTER TABLE public.plaintes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.litiges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  parcelle_id uuid NOT NULL REFERENCES public.parcelles(id) ON DELETE CASCADE,
  plainte_id uuid REFERENCES public.plaintes(id) ON DELETE SET NULL,
  objet text NOT NULL,
  parties text,
  statut public.statut_litige NOT NULL DEFAULT 'nouveau',
  date_ouverture date NOT NULL DEFAULT CURRENT_DATE,
  date_cloture date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.litiges TO authenticated;
GRANT ALL ON public.litiges TO service_role;
ALTER TABLE public.litiges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  litige_id uuid NOT NULL REFERENCES public.litiges(id) ON DELETE CASCADE,
  tribunal text NOT NULL,
  date_decision date NOT NULL DEFAULT CURRENT_DATE,
  resume text NOT NULL,
  document_url text,
  statut text NOT NULL DEFAULT 'rendue',
  date_transmission timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.alertes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_evenement text NOT NULL,
  message text NOT NULL,
  priorite public.niveau_priorite NOT NULL DEFAULT 'moyen',
  parcelle_id uuid REFERENCES public.parcelles(id) ON DELETE CASCADE,
  plainte_id uuid REFERENCES public.plaintes(id) ON DELETE SET NULL,
  litige_id uuid REFERENCES public.litiges(id) ON DELETE SET NULL,
  decision_id uuid REFERENCES public.decisions(id) ON DELETE SET NULL,
  traitee boolean NOT NULL DEFAULT false,
  traitee_par uuid,
  traitee_le timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertes TO authenticated;
GRANT ALL ON public.alertes TO service_role;
ALTER TABLE public.alertes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  alerte_id uuid REFERENCES public.alertes(id) ON DELETE CASCADE,
  titre text NOT NULL,
  message text NOT NULL,
  priorite public.niveau_priorite NOT NULL DEFAULT 'moyen',
  lu boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.historique_parcelle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelle_id uuid NOT NULL REFERENCES public.parcelles(id) ON DELETE CASCADE,
  date_evenement timestamptz NOT NULL DEFAULT now(),
  evenement text NOT NULL,
  acteur text NOT NULL DEFAULT 'Système',
  statut text,
  details text,
  user_id uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historique_parcelle TO authenticated;
GRANT ALL ON public.historique_parcelle TO service_role;
ALTER TABLE public.historique_parcelle ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.journal_activite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entite text,
  entite_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.journal_activite TO authenticated;
GRANT ALL ON public.journal_activite TO service_role;
ALTER TABLE public.journal_activite ENABLE ROW LEVEL SECURITY;

-- ============ POLITIQUES ============
CREATE POLICY "profils lisibles par les utilisateurs connectés" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "création de son propre profil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "mise à jour de son profil ou par admin" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'administrateur'));
CREATE POLICY "suppression par admin" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "roles visibles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles gérés par admin" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrateur'))
  WITH CHECK (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "parcelles consultables" ON public.parcelles
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "parcelles créées par cadastre" ON public.parcelles
  FOR INSERT TO authenticated WITH CHECK (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'cadastre') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "parcelles modifiées par cadastre" ON public.parcelles
  FOR UPDATE TO authenticated USING (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'cadastre') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "parcelles supprimées par admin" ON public.parcelles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "plaintes consultables" ON public.plaintes
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "plaintes créées par tribunal" ON public.plaintes
  FOR INSERT TO authenticated WITH CHECK (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "plaintes modifiées par tribunal" ON public.plaintes
  FOR UPDATE TO authenticated USING (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "plaintes supprimées par admin" ON public.plaintes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "litiges consultables" ON public.litiges
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "litiges créés par tribunal" ON public.litiges
  FOR INSERT TO authenticated WITH CHECK (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "litiges modifiés par tribunal" ON public.litiges
  FOR UPDATE TO authenticated USING (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "litiges supprimés par admin" ON public.litiges
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "décisions consultables" ON public.decisions
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "décisions créées par tribunal" ON public.decisions
  FOR INSERT TO authenticated WITH CHECK (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "décisions modifiées par tribunal" ON public.decisions
  FOR UPDATE TO authenticated USING (public.est_actif(auth.uid()) AND (public.has_role(auth.uid(),'tribunal') OR public.has_role(auth.uid(),'administrateur')));
CREATE POLICY "décisions supprimées par admin" ON public.decisions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrateur'));

CREATE POLICY "alertes consultables" ON public.alertes
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "alertes traitées par agents" ON public.alertes
  FOR UPDATE TO authenticated USING (public.est_actif(auth.uid()) AND NOT public.has_role(auth.uid(),'consultation'));

CREATE POLICY "notifications personnelles" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications marquées lues" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "historique consultable" ON public.historique_parcelle
  FOR SELECT TO authenticated USING (public.est_actif(auth.uid()));
CREATE POLICY "historique ajouté par agents" ON public.historique_parcelle
  FOR INSERT TO authenticated WITH CHECK (public.est_actif(auth.uid()) AND NOT public.has_role(auth.uid(),'consultation'));

CREATE POLICY "journal lisible par admin" ON public.journal_activite
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'administrateur'));
CREATE POLICY "journal alimenté par les utilisateurs" ON public.journal_activite
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ MOTEUR D'ALERTES ============
CREATE OR REPLACE FUNCTION public.creer_alerte(
  _type text, _message text, _priorite public.niveau_priorite,
  _parcelle uuid, _plainte uuid, _litige uuid, _decision uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.alertes(type_evenement, message, priorite, parcelle_id, plainte_id, litige_id, decision_id)
  VALUES (_type, _message, _priorite, _parcelle, _plainte, _litige, _decision)
  RETURNING id INTO _id;

  INSERT INTO public.notifications(user_id, alerte_id, titre, message, priorite)
  SELECT p.id, _id, _type, _message, _priorite
  FROM public.profiles p WHERE p.actif = true;

  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_plainte_creee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code text;
BEGIN
  SELECT code_parcelle INTO _code FROM public.parcelles WHERE id = NEW.parcelle_id;
  PERFORM public.creer_alerte('Nouvelle plainte',
    'Plainte ' || NEW.numero || ' enregistrée sur la parcelle ' || COALESCE(_code,'?') || ' : ' || NEW.motif,
    'eleve', NEW.parcelle_id, NEW.id, NULL, NULL);
  INSERT INTO public.historique_parcelle(parcelle_id, evenement, acteur, statut, details, user_id)
  VALUES (NEW.parcelle_id, 'Plainte enregistrée (' || NEW.numero || ')', 'Tribunal', 'Plainte', NEW.motif, NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_plainte_creee AFTER INSERT ON public.plaintes
FOR EACH ROW EXECUTE FUNCTION public.tg_plainte_creee();

CREATE OR REPLACE FUNCTION public.tg_litige_cree()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _code text;
BEGIN
  SELECT code_parcelle INTO _code FROM public.parcelles WHERE id = NEW.parcelle_id;
  UPDATE public.parcelles SET statut = 'en_litige', updated_at = now() WHERE id = NEW.parcelle_id;
  PERFORM public.creer_alerte('Litige ouvert',
    'Dossier de litige ' || NEW.numero || ' ouvert sur la parcelle ' || COALESCE(_code,'?'),
    'critique', NEW.parcelle_id, NEW.plainte_id, NEW.id, NULL);
  INSERT INTO public.historique_parcelle(parcelle_id, evenement, acteur, statut, details, user_id)
  VALUES (NEW.parcelle_id, 'Ouverture du litige ' || NEW.numero, 'Tribunal', 'En litige', NEW.objet, NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_litige_cree AFTER INSERT ON public.litiges
FOR EACH ROW EXECUTE FUNCTION public.tg_litige_cree();

CREATE OR REPLACE FUNCTION public.tg_litige_statut()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    PERFORM public.creer_alerte('Changement de statut de litige',
      'Le litige ' || NEW.numero || ' est passé au statut « ' || NEW.statut || ' »',
      'moyen', NEW.parcelle_id, NEW.plainte_id, NEW.id, NULL);
    INSERT INTO public.historique_parcelle(parcelle_id, evenement, acteur, statut, details)
    VALUES (NEW.parcelle_id, 'Litige ' || NEW.numero || ' : statut mis à jour', 'Tribunal', NEW.statut::text, NULL);
    IF NEW.statut IN ('resolu','cloture') THEN
      UPDATE public.parcelles SET statut = 'mis_a_jour', updated_at = now() WHERE id = NEW.parcelle_id;
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_litige_statut BEFORE UPDATE ON public.litiges
FOR EACH ROW EXECUTE FUNCTION public.tg_litige_statut();

CREATE OR REPLACE FUNCTION public.tg_decision_creee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _parcelle uuid; _num text;
BEGIN
  SELECT parcelle_id, numero INTO _parcelle, _num FROM public.litiges WHERE id = NEW.litige_id;
  UPDATE public.litiges SET statut = 'decide' WHERE id = NEW.litige_id AND statut <> 'decide';
  UPDATE public.parcelles SET statut = 'decision_rendue', updated_at = now() WHERE id = _parcelle;
  PERFORM public.creer_alerte('Décision judiciaire',
    'Décision ' || NEW.numero || ' rendue par ' || NEW.tribunal || ' sur le dossier ' || COALESCE(_num,'?'),
    'critique', _parcelle, NULL, NEW.litige_id, NEW.id);
  INSERT INTO public.historique_parcelle(parcelle_id, evenement, acteur, statut, details, user_id)
  VALUES (_parcelle, 'Décision ' || NEW.numero, 'Tribunal', 'Décision rendue', NEW.resume, NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_decision_creee AFTER INSERT ON public.decisions
FOR EACH ROW EXECUTE FUNCTION public.tg_decision_creee();

CREATE OR REPLACE FUNCTION public.tg_parcelle_creee()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.historique_parcelle(parcelle_id, evenement, acteur, statut, details, user_id)
  VALUES (NEW.id, 'Création de la parcelle', 'Cadastre', NEW.statut::text, NEW.reference_cadastrale, NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_parcelle_creee AFTER INSERT ON public.parcelles
FOR EACH ROW EXECUTE FUNCTION public.tg_parcelle_creee();

-- ============ DONNÉES DE DÉMONSTRATION ============
INSERT INTO public.parcelles (code_parcelle, reference_cadastrale, prefecture, commune, localite, superficie_m2, proprietaire, type_titre, statut, latitude, longitude, geometrie) VALUES
('PAR-GLF-001','TF-1245/GLF','Golfe','Lomé','Bè-Kpota',620,'AGBEKO Kossi','Titre foncier','actif',6.1725,1.2310, '{"type":"Polygon","coordinates":[[[1.2300,6.1718],[1.2320,6.1718],[1.2320,6.1732],[1.2300,6.1732],[1.2300,6.1718]]]}'),
('PAR-GLF-002','TF-1310/GLF','Golfe','Lomé','Adakpamé',450,'MENSAH Afi','Permis d''habiter','actif',6.1802,1.2555,'{"type":"Polygon","coordinates":[[[1.2545,6.1795],[1.2565,6.1795],[1.2565,6.1809],[1.2545,6.1809],[1.2545,6.1795]]]}'),
('PAR-AGN-001','TF-0876/AGN','Agoè-Nyivé','Agoè','Légbassito',800,'KOUDJO Ayélé','Titre foncier','actif',6.2380,1.1890,'{"type":"Polygon","coordinates":[[[1.1880,6.2372],[1.1902,6.2372],[1.1902,6.2388],[1.1880,6.2388],[1.1880,6.2372]]]}'),
('PAR-AGN-002','TF-0921/AGN','Agoè-Nyivé','Agoè','Adétikopé',1200,'Société SOTOFA','Bail emphytéotique','actif',6.3100,1.2050,'{"type":"Polygon","coordinates":[[[1.2040,6.3090],[1.2064,6.3090],[1.2064,6.3110],[1.2040,6.3110],[1.2040,6.3090]]]}'),
('PAR-ZIO-001','TF-0450/ZIO','Zio','Tsévié','Kpomé',1500,'ADJAVON Komla','Titre foncier','actif',6.4265,1.2130,'{"type":"Polygon","coordinates":[[[1.2118,6.4255],[1.2144,6.4255],[1.2144,6.4276],[1.2118,6.4276],[1.2118,6.4255]]]}'),
('PAR-ZIO-002','TF-0488/ZIO','Zio','Tsévié','Davié',960,'Collectivité DAVIÉ','Droit coutumier','actif',6.3720,1.2200,'{"type":"Polygon","coordinates":[[[1.2190,6.3710],[1.2212,6.3710],[1.2212,6.3730],[1.2190,6.3730],[1.2190,6.3710]]]}'),
('PAR-AVE-001','TF-0302/AVE','Avé','Kévé','Assahoun',2000,'DOSSOU Yawo','Titre foncier','actif',6.4400,0.9800,'{"type":"Polygon","coordinates":[[[0.9788,6.4390],[0.9814,6.4390],[0.9814,6.4412],[0.9788,6.4412],[0.9788,6.4390]]]}'),
('PAR-VO-001','TF-0615/VO','Vo','Vogan','Akoumapé',1100,'AMEGAN Sena','Permis d''habiter','actif',6.3300,1.5300,'{"type":"Polygon","coordinates":[[[1.5290,6.3290],[1.5312,6.3290],[1.5312,6.3311],[1.5290,6.3311],[1.5290,6.3290]]]}'),
('PAR-YOT-001','TF-0733/YOT','Yoto','Tabligbo','Ahépé',1750,'Famille GBEDEMAH','Droit coutumier','actif',6.5850,1.5000,'{"type":"Polygon","coordinates":[[[1.4988,6.5840],[1.5014,6.5840],[1.5014,6.5862],[1.4988,6.5862],[1.4988,6.5840]]]}'),
('PAR-LAC-001','TF-0199/LAC','Lacs','Aného','Zébé',540,'AKAKPO Edem','Titre foncier','actif',6.2280,1.5940,'{"type":"Polygon","coordinates":[[[1.5930,6.2272],[1.5952,6.2272],[1.5952,6.2290],[1.5930,6.2290],[1.5930,6.2272]]]}'),
('PAR-LAC-002','TF-0207/LAC','Lacs','Aného','Agbodrafo',720,'LAWSON Kodjo','Titre foncier','actif',6.2320,1.4350,'{"type":"Polygon","coordinates":[[[1.4340,6.2312],[1.4362,6.2312],[1.4362,6.2330],[1.4340,6.2330],[1.4340,6.2312]]]}'),
('PAR-BMO-001','TF-0141/BMO','Bas-Mono','Afanyangan','Attitogon',1300,'Coopérative MONO','Bail rural','actif',6.4100,1.6400,'{"type":"Polygon","coordinates":[[[1.6390,6.4090],[1.6414,6.4090],[1.6414,6.4112],[1.6390,6.4112],[1.6390,6.4090]]]}');

INSERT INTO public.plaintes (numero, parcelle_id, plaignant, partie_adverse, motif, description, statut, date_depot)
SELECT 'PL-2026-001', id, 'AGBEKO Kossi', 'HOUNKPATI Mawulé', 'Double attribution de parcelle', 'Deux titres distincts présentés pour la même parcelle à Bè-Kpota.', 'transformee_en_litige', CURRENT_DATE - 30 FROM public.parcelles WHERE code_parcelle = 'PAR-GLF-001';
INSERT INTO public.plaintes (numero, parcelle_id, plaignant, partie_adverse, motif, description, statut, date_depot)
SELECT 'PL-2026-002', id, 'Collectivité DAVIÉ', 'SODJI Yao', 'Empiètement de limites', 'Occupation d''une bande de 12 m sur la limite est.', 'en_examen', CURRENT_DATE - 12 FROM public.parcelles WHERE code_parcelle = 'PAR-ZIO-002';
INSERT INTO public.plaintes (numero, parcelle_id, plaignant, partie_adverse, motif, description, statut, date_depot)
SELECT 'PL-2026-003', id, 'AKAKPO Edem', 'Héritiers AKAKPO', 'Conflit successoral', 'Contestation du partage successoral de la parcelle.', 'enregistree', CURRENT_DATE - 5 FROM public.parcelles WHERE code_parcelle = 'PAR-LAC-001';

INSERT INTO public.litiges (numero, parcelle_id, plainte_id, objet, parties, statut, date_ouverture)
SELECT 'LIT-2026-001', p.parcelle_id, p.id, 'Double attribution de la parcelle PAR-GLF-001', 'AGBEKO Kossi / HOUNKPATI Mawulé', 'en_attente_decision', CURRENT_DATE - 25
FROM public.plaintes p WHERE p.numero = 'PL-2026-001';
INSERT INTO public.litiges (numero, parcelle_id, plainte_id, objet, parties, statut, date_ouverture)
SELECT 'LIT-2026-002', p.parcelle_id, p.id, 'Empiètement de limites à Davié', 'Collectivité DAVIÉ / SODJI Yao', 'en_cours', CURRENT_DATE - 8
FROM public.plaintes p WHERE p.numero = 'PL-2026-002';
