-- ===== Roles & profiles =====
CREATE TYPE public.app_role AS ENUM ('ADMIN','DISPATCHER','STOREKEEPER','LOADER','DRIVER');

CREATE TABLE public.depot (
  id text PRIMARY KEY, name text NOT NULL, district_id text, active boolean NOT NULL DEFAULT true);
CREATE TABLE public.district (
  id text PRIMARY KEY, name text NOT NULL, depot_id text NOT NULL REFERENCES public.depot(id),
  depot_to_district_freeflow_min integer NOT NULL CHECK (depot_to_district_freeflow_min >= 0),
  depot_to_district_km numeric(8,2) NOT NULL CHECK (depot_to_district_km >= 0),
  inter_stop_freeflow_min integer NOT NULL CHECK (inter_stop_freeflow_min >= 0),
  inter_stop_km numeric(8,2) NOT NULL CHECK (inter_stop_km >= 0));
CREATE TABLE public.outlet (
  id text PRIMARY KEY, name text NOT NULL,
  brand text NOT NULL CHECK (brand IN ('FRESH','STYLE','TECH')),
  district_id text NOT NULL REFERENCES public.district(id),
  depot_id text NOT NULL REFERENCES public.depot(id),
  parking_constraint text NOT NULL CHECK (parking_constraint IN ('STANDARD','VAN_ONLY')),
  dock_type text NOT NULL CHECK (dock_type IN ('REAR_DOCK','STREET','MALL')),
  window_open time NOT NULL, window_close time NOT NULL,
  mall_window_start time, mall_window_end time,
  address text, latitude double precision, longitude double precision,
  active boolean NOT NULL DEFAULT true);
CREATE TABLE public.vehicle (
  id text PRIMARY KEY, home_depot_id text NOT NULL REFERENCES public.depot(id),
  type text NOT NULL CHECK (type IN ('TRUCK','VAN')),
  temp text NOT NULL CHECK (temp IN ('REEFER','AMBIENT')),
  status text NOT NULL CHECK (status IN ('AVAILABLE','IN_WORKSHOP')),
  weight_cap_kg numeric(10,2) NOT NULL CHECK (weight_cap_kg > 0),
  volume_cap_m3 numeric(10,2) NOT NULL CHECK (volume_cap_m3 > 0),
  weekly_fuel_quota_l numeric(10,2) NOT NULL CHECK (weekly_fuel_quota_l > 0),
  km_per_l numeric(8,2) NOT NULL CHECK (km_per_l > 0));
CREATE TABLE public.service_allowance (
  brand text NOT NULL CHECK (brand IN ('FRESH','STYLE','TECH')), dock_type text NOT NULL,
  minutes integer NOT NULL CHECK (minutes >= 0), PRIMARY KEY (brand, dock_type));

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  display_name text,
  outlet_id text REFERENCES public.outlet(id),
  depot_id text REFERENCES public.depot(id),
  vehicle_id text REFERENCES public.vehicle(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id
                 WHERE r.user_id = _user_id AND r.role = _role AND p.active)
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id
                 WHERE r.user_id = _user_id AND p.active)
$$;
CREATE OR REPLACE FUNCTION public.my_outlet()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT outlet_id FROM public.profiles WHERE id = auth.uid() AND active
$$;
CREATE OR REPLACE FUNCTION public.my_vehicle()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT vehicle_id FROM public.profiles WHERE id = auth.uid() AND active
$$;

-- New sign-ups get a profile; the very first account becomes ADMIN (bootstrap).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, email, display_name)
  VALUES (NEW.id, lower(NEW.email), COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'ADMIN') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'ADMIN');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Operations =====
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text UNIQUE NOT NULL,
  outlet_id text NOT NULL REFERENCES public.outlet(id),
  product_brand text NOT NULL CHECK (product_brand IN ('FRESH','STYLE','TECH')),
  item_description text NOT NULL,
  order_date date NOT NULL,
  placed_at timestamptz NOT NULL DEFAULT now(),
  after_cutoff boolean NOT NULL DEFAULT false,
  temp_requirement text NOT NULL CHECK (temp_requirement IN ('CHILLED','AMBIENT')),
  order_units integer NOT NULL CHECK (order_units > 0),
  order_weight_kg numeric(10,2) NOT NULL CHECK (order_weight_kg > 0),
  order_volume_m3 numeric(10,3) NOT NULL CHECK (order_volume_m3 > 0),
  status text NOT NULL CHECK (status IN ('PLACED','CONFIRMED','QUEUED','PLANNED','LOADING','SHORT_LOADED','LOADED','IN_TRANSIT','DELIVERED','RECEIVED','NEXT_RUN','DEFERRED','FAILED','DISPUTED')),
  days_since_last_served integer NOT NULL DEFAULT 0,
  deferred_yesterday boolean NOT NULL DEFAULT false,
  created_by uuid);
CREATE INDEX orders_outlet_date_idx ON public.orders(outlet_id, order_date);
CREATE INDEX orders_status_date_idx ON public.orders(status, order_date);

CREATE TABLE public.dispatch_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_id text NOT NULL REFERENCES public.depot(id),
  plan_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT','PUBLISHED')),
  created_by uuid, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(depot_id, plan_date));
CREATE TABLE public.trip (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.dispatch_plan(id) ON DELETE CASCADE,
  vehicle_id text NOT NULL REFERENCES public.vehicle(id),
  trip_no integer NOT NULL CHECK (trip_no IN (1,2)),
  brand text NOT NULL, district_id text NOT NULL REFERENCES public.district(id),
  temp_class text NOT NULL CHECK (temp_class IN ('CHILLED','AMBIENT')),
  planned_minutes integer NOT NULL, total_weight_kg numeric(10,2) NOT NULL,
  total_volume_m3 numeric(10,3) NOT NULL, est_km numeric(10,2) NOT NULL, est_fuel_l numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','LOADING','LOADED','IN_PROGRESS','COMPLETED','CANCELLED')),
  started_at timestamptz,
  UNIQUE(plan_id, vehicle_id, trip_no));
CREATE TABLE public.trip_stop (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trip(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id),
  seq integer NOT NULL, planned_arrival timestamptz,
  handling_allowance_min integer NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED',
  loading_status text NOT NULL DEFAULT 'PENDING',
  note text,
  UNIQUE(trip_id, order_id), UNIQUE(trip_id, seq));
CREATE TABLE public.deferral_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  plan_id uuid NOT NULL REFERENCES public.dispatch_plan(id) ON DELETE CASCADE,
  reason_code text NOT NULL, unavoidable boolean NOT NULL,
  priority_score numeric(8,2) NOT NULL, score_breakdown jsonb NOT NULL,
  dispatcher_note text, notified_at timestamptz);
CREATE TABLE public.fuel_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL REFERENCES public.vehicle(id),
  week_start date NOT NULL, litres_used numeric(10,2) NOT NULL DEFAULT 0,
  UNIQUE(vehicle_id, week_start));

CREATE TABLE public.loading_defect (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES public.trip_stop(id) ON DELETE CASCADE,
  issue_type text NOT NULL, severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved','confirmed','resolved')),
  created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.loading_missing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES public.trip_stop(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending-investigation' CHECK (status IN ('pending-investigation','located')),
  created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE public.proof_of_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES public.trip_stop(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  receiver_name text, outcome text NOT NULL CHECK (outcome IN ('DELIVERED','PARTIAL_DELIVERY','UNABLE_TO_DELIVER')),
  delivered_units integer, short_units integer, condition_notes text,
  photo_reference text, signature_reference text, client_event_id text UNIQUE,
  event_time timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.driver_fuel_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL, vehicle_id text REFERENCES public.vehicle(id),
  fuel_date date NOT NULL, odometer_km numeric(10,1) NOT NULL, litres numeric(10,2) NOT NULL,
  station text NOT NULL, cost numeric(12,2), currency text NOT NULL DEFAULT 'LKR',
  receipt_reference text, client_event_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.driver_fine_report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL, stop_id uuid REFERENCES public.trip_stop(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL, currency text NOT NULL DEFAULT 'LKR', reason text NOT NULL,
  location text, ticket_reference text, issued_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'REPORTED', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.driver_incident_report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL, stop_id uuid REFERENCES public.trip_stop(id) ON DELETE SET NULL,
  type text NOT NULL, notes text, location text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'OPEN', created_at timestamptz NOT NULL DEFAULT now());

-- ===== Grants =====
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['depot','district','outlet','vehicle','service_allowance','profiles','orders',
    'dispatch_plan','trip','trip_stop','deferral_record','fuel_usage','loading_defect','loading_missing',
    'proof_of_delivery','driver_fuel_log','driver_fine_report','driver_incident_report'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== Policies =====
CREATE POLICY "own roles or admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'ADMIN'));

CREATE POLICY "own profile or admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'ADMIN'));
CREATE POLICY "admin updates profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'ADMIN')) WITH CHECK (public.has_role(auth.uid(),'ADMIN'));

-- Reference data: readable by staff, editable by admin
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['depot','district','outlet','vehicle','service_allowance'] LOOP
    EXECUTE format('CREATE POLICY "staff read" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''ADMIN'')) WITH CHECK (public.has_role(auth.uid(),''ADMIN''))', t);
  END LOOP;
END $$;

-- Orders: store managers see/insert their outlet; operations roles see all
CREATE POLICY "orders read" ON public.orders FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'ADMIN') OR public.has_role(auth.uid(),'DISPATCHER')
  OR public.has_role(auth.uid(),'LOADER') OR public.has_role(auth.uid(),'DRIVER')
  OR (public.has_role(auth.uid(),'STOREKEEPER') AND outlet_id = public.my_outlet()));
CREATE POLICY "store places orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'STOREKEEPER') AND outlet_id = public.my_outlet() AND created_by = auth.uid());
CREATE POLICY "ops update orders" ON public.orders FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'ADMIN') OR public.has_role(auth.uid(),'DISPATCHER')
  OR public.has_role(auth.uid(),'LOADER') OR public.has_role(auth.uid(),'DRIVER')
  OR (public.has_role(auth.uid(),'STOREKEEPER') AND outlet_id = public.my_outlet()));

-- Planning & trips: staff read; dispatcher/admin write; loader/driver update status
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['dispatch_plan','trip','trip_stop','deferral_record','fuel_usage','loading_defect','loading_missing'] LOOP
    EXECUTE format('CREATE POLICY "staff read" ON public.%I FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "planner write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''ADMIN'') OR public.has_role(auth.uid(),''DISPATCHER'')) WITH CHECK (public.has_role(auth.uid(),''ADMIN'') OR public.has_role(auth.uid(),''DISPATCHER''))', t);
  END LOOP;
END $$;
CREATE POLICY "loader/driver update trips" ON public.trip FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'LOADER') OR (public.has_role(auth.uid(),'DRIVER') AND vehicle_id = public.my_vehicle()));
CREATE POLICY "loader/driver update stops" ON public.trip_stop FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'LOADER') OR public.has_role(auth.uid(),'DRIVER'));
CREATE POLICY "loader writes defects" ON public.loading_defect FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'LOADER') AND created_by = auth.uid());
CREATE POLICY "loader updates defects" ON public.loading_defect FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'LOADER'));
CREATE POLICY "loader writes missing" ON public.loading_missing FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'LOADER'));
CREATE POLICY "loader updates missing" ON public.loading_missing FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'LOADER'));

-- Driver records: drivers own theirs; admin/dispatcher read all
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['proof_of_delivery','driver_fuel_log','driver_fine_report','driver_incident_report'] LOOP
    EXECUTE format('CREATE POLICY "driver own read" ON public.%I FOR SELECT TO authenticated USING (driver_id = auth.uid() OR public.has_role(auth.uid(),''ADMIN'') OR public.has_role(auth.uid(),''DISPATCHER''))', t);
    EXECUTE format('CREATE POLICY "driver own insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid() AND public.has_role(auth.uid(),''DRIVER''))', t);
    EXECUTE format('CREATE POLICY "ops update" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),''ADMIN'') OR public.has_role(auth.uid(),''DISPATCHER''))', t);
  END LOOP;
END $$;

-- ===== Reference data (from Flyway V2-V4) =====
INSERT INTO public.depot(id, name) VALUES ('PELIYAGODA','Peliyagoda distribution centre'),('KANDY','Kandy regional hub');
INSERT INTO public.district VALUES
  ('GAMPAHA','Gampaha','PELIYAGODA',37,24.0,9,4.0),
  ('COLOMBO','Colombo','PELIYAGODA',28,18.0,7,3.0),
  ('KANDY_CITY','Kandy City','KANDY',20,12.0,6,2.5);
INSERT INTO public.service_allowance VALUES
  ('FRESH','REAR_DOCK',15),('FRESH','STREET',16),('FRESH','MALL',16),
  ('STYLE','REAR_DOCK',20),('STYLE','STREET',25),('STYLE','MALL',35),
  ('TECH','REAR_DOCK',30),('TECH','STREET',35),('TECH','MALL',40);
INSERT INTO public.vehicle VALUES
  ('VEH001','PELIYAGODA','TRUCK','REEFER','AVAILABLE',8000,32,900,3.5),
  ('VEH002','PELIYAGODA','TRUCK','AMBIENT','AVAILABLE',9000,38,950,3.8),
  ('VEH003','PELIYAGODA','VAN','REEFER','AVAILABLE',1800,10,500,7.0),
  ('VEH004','KANDY','TRUCK','AMBIENT','AVAILABLE',9000,38,950,3.8);
INSERT INTO public.outlet(id,name,brand,district_id,depot_id,parking_constraint,dock_type,window_open,window_close,address,latitude,longitude) VALUES
  ('OUT001','Fresh Gampaha','FRESH','GAMPAHA','PELIYAGODA','STANDARD','REAR_DOCK','03:30','08:00','Colombo Rd, Gampaha',7.0873,79.9998),
  ('OUT002','Fresh Gampaha Street','FRESH','GAMPAHA','PELIYAGODA','VAN_ONLY','STREET','03:30','08:00','Bauddhaloka Mawatha, Gampaha',7.0917,80.0144),
  ('OUT003','Style Colombo Mall','STYLE','COLOMBO','PELIYAGODA','STANDARD','MALL','09:00','20:00','One Galle Face Mall, Colombo 02',6.9271,79.8450),
  ('OUT004','Tech Colombo','TECH','COLOMBO','PELIYAGODA','STANDARD','STREET','09:00','18:00','Galle Rd, Colombo 03',6.9022,79.8530);