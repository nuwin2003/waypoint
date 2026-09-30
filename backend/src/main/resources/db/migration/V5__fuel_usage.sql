CREATE TABLE fuel_usage (
  id uuid PRIMARY KEY,
  vehicle_id varchar(16) NOT NULL REFERENCES vehicle(id),
  week_start date NOT NULL,
  litres_used numeric(10,2) NOT NULL DEFAULT 0 CHECK (litres_used >= 0),
  UNIQUE(vehicle_id, week_start)
);
