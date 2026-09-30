CREATE TABLE depot (
  id varchar(32) PRIMARY KEY,
  name varchar(120) NOT NULL,
  district_id varchar(32),
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE district (
  id varchar(32) PRIMARY KEY,
  name varchar(120) NOT NULL,
  depot_id varchar(32) NOT NULL REFERENCES depot(id),
  depot_to_district_freeflow_min integer NOT NULL CHECK (depot_to_district_freeflow_min >= 0),
  depot_to_district_km numeric(8,2) NOT NULL CHECK (depot_to_district_km >= 0),
  inter_stop_freeflow_min integer NOT NULL CHECK (inter_stop_freeflow_min >= 0),
  inter_stop_km numeric(8,2) NOT NULL CHECK (inter_stop_km >= 0)
);
CREATE TABLE outlet (
  id varchar(16) PRIMARY KEY,
  name varchar(160) NOT NULL,
  brand varchar(16) NOT NULL CHECK (brand IN ('FRESH','STYLE','TECH')),
  district_id varchar(32) NOT NULL REFERENCES district(id),
  depot_id varchar(32) NOT NULL REFERENCES depot(id),
  parking_constraint varchar(16) NOT NULL CHECK (parking_constraint IN ('STANDARD','VAN_ONLY')),
  dock_type varchar(16) NOT NULL CHECK (dock_type IN ('REAR_DOCK','STREET','MALL')),
  window_open time NOT NULL,
  window_close time NOT NULL,
  mall_window_start time,
  mall_window_end time,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE vehicle (
  id varchar(16) PRIMARY KEY,
  home_depot_id varchar(32) NOT NULL REFERENCES depot(id),
  type varchar(16) NOT NULL CHECK (type IN ('TRUCK','VAN')),
  temp varchar(16) NOT NULL CHECK (temp IN ('REEFER','AMBIENT')),
  status varchar(16) NOT NULL CHECK (status IN ('AVAILABLE','IN_WORKSHOP')),
  weight_cap_kg numeric(10,2) NOT NULL CHECK (weight_cap_kg > 0),
  volume_cap_m3 numeric(10,2) NOT NULL CHECK (volume_cap_m3 > 0),
  weekly_fuel_quota_l numeric(10,2) NOT NULL CHECK (weekly_fuel_quota_l > 0),
  km_per_l numeric(8,2) NOT NULL CHECK (km_per_l > 0)
);
CREATE TABLE calendar_day (
  day_date date PRIMARY KEY,
  is_operating boolean NOT NULL
);
CREATE TABLE service_allowance (
  brand varchar(16) NOT NULL CHECK (brand IN ('FRESH','STYLE','TECH')),
  dock_type varchar(16) NOT NULL,
  minutes integer NOT NULL CHECK (minutes >= 0),
  PRIMARY KEY (brand, dock_type)
);
CREATE TABLE app_user (
  id uuid PRIMARY KEY,
  email varchar(254) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  role varchar(24) NOT NULL CHECK (role IN ('STORE_MANAGER','DISPATCHER','LOADER','DRIVER')),
  outlet_id varchar(16) REFERENCES outlet(id),
  depot_id varchar(32) REFERENCES depot(id),
  vehicle_id varchar(16) REFERENCES vehicle(id),
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  order_ref varchar(32) UNIQUE NOT NULL,
  outlet_id varchar(16) NOT NULL REFERENCES outlet(id),
  order_date date NOT NULL,
  placed_at timestamptz NOT NULL,
  after_cutoff boolean NOT NULL DEFAULT false,
  temp_requirement varchar(16) NOT NULL CHECK (temp_requirement IN ('CHILLED','AMBIENT')),
  order_units integer NOT NULL CHECK (order_units > 0),
  order_weight_kg numeric(10,2) NOT NULL CHECK (order_weight_kg > 0),
  order_volume_m3 numeric(10,3) NOT NULL CHECK (order_volume_m3 > 0),
  status varchar(16) NOT NULL CHECK (status IN ('PLACED','CONFIRMED','QUEUED','PLANNED','LOADING','SHORT_LOADED','LOADED','IN_TRANSIT','DELIVERED','RECEIVED','NEXT_RUN','DEFERRED','FAILED','DISPUTED')),
  days_since_last_served integer NOT NULL DEFAULT 0 CHECK (days_since_last_served >= 0),
  deferred_yesterday boolean NOT NULL DEFAULT false,
  version bigint NOT NULL DEFAULT 0
);
CREATE INDEX orders_outlet_date_idx ON orders(outlet_id, order_date);
CREATE INDEX orders_status_date_idx ON orders(status, order_date);
CREATE TABLE dispatch_plan (
  id uuid PRIMARY KEY,
  depot_id varchar(32) NOT NULL REFERENCES depot(id),
  plan_date date NOT NULL,
  status varchar(16) NOT NULL CHECK (status IN ('DRAFT','PUBLISHED')),
  rule_report jsonb NOT NULL DEFAULT '{}'::jsonb,
  capacity_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES app_user(id),
  published_at timestamptz,
  version bigint NOT NULL DEFAULT 0,
  UNIQUE(depot_id, plan_date)
);
CREATE TABLE trip (
  id uuid PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES dispatch_plan(id),
  vehicle_id varchar(16) NOT NULL REFERENCES vehicle(id),
  trip_no integer NOT NULL CHECK (trip_no IN (1,2)),
  brand varchar(16) NOT NULL CHECK (brand IN ('FRESH','STYLE','TECH')),
  district_id varchar(32) NOT NULL REFERENCES district(id),
  temp_class varchar(16) NOT NULL CHECK (temp_class IN ('CHILLED','AMBIENT')),
  planned_minutes integer NOT NULL CHECK (planned_minutes >= 0),
  total_weight_kg numeric(10,2) NOT NULL,
  total_volume_m3 numeric(10,3) NOT NULL,
  est_km numeric(10,2) NOT NULL,
  est_fuel_l numeric(10,2) NOT NULL,
  status varchar(16) NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','LOADING','LOADED','IN_PROGRESS','COMPLETED','CANCELLED')),
  UNIQUE(plan_id, vehicle_id, trip_no)
);
CREATE TABLE trip_stop (
  id uuid PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES trip(id),
  order_id uuid NOT NULL REFERENCES orders(id),
  seq integer NOT NULL CHECK (seq >= 0),
  planned_arrival timestamptz,
  handling_allowance_min integer NOT NULL CHECK (handling_allowance_min >= 0),
  status varchar(16) NOT NULL DEFAULT 'PLANNED',
  UNIQUE(trip_id, order_id),
  UNIQUE(trip_id, seq)
);
CREATE TABLE deferral_record (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  plan_id uuid NOT NULL REFERENCES dispatch_plan(id),
  reason_code varchar(32) NOT NULL,
  unavoidable boolean NOT NULL,
  priority_score numeric(8,2) NOT NULL,
  score_breakdown jsonb NOT NULL,
  dispatcher_note varchar(1000),
  notified_at timestamptz
);
