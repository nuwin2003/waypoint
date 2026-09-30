INSERT INTO depot(id, name) VALUES ('PELIYAGODA', 'Peliyagoda distribution centre'), ('KANDY', 'Kandy regional hub');
INSERT INTO district(id, name, depot_id, depot_to_district_freeflow_min, depot_to_district_km, inter_stop_freeflow_min, inter_stop_km) VALUES
  ('GAMPAHA', 'Gampaha', 'PELIYAGODA', 37, 24.0, 9, 4.0),
  ('COLOMBO', 'Colombo', 'PELIYAGODA', 28, 18.0, 7, 3.0),
  ('KANDY_CITY', 'Kandy City', 'KANDY', 20, 12.0, 6, 2.5);
INSERT INTO service_allowance(brand, dock_type, minutes) VALUES
  ('FRESH', 'REAR_DOCK', 15), ('FRESH', 'STREET', 15), ('FRESH', 'MALL', 16),
  ('STYLE', 'REAR_DOCK', 20), ('STYLE', 'STREET', 25), ('STYLE', 'MALL', 35),
  ('TECH', 'REAR_DOCK', 30), ('TECH', 'STREET', 35), ('TECH', 'MALL', 40);
INSERT INTO calendar_day(day_date, is_operating)
SELECT day::date, EXTRACT(ISODOW FROM day)::int BETWEEN 1 AND 6
FROM generate_series('2026-01-01'::date, '2026-12-31'::date, interval '1 day') day;
INSERT INTO vehicle(id, home_depot_id, type, temp, status, weight_cap_kg, volume_cap_m3, weekly_fuel_quota_l, km_per_l) VALUES
  ('VEH001', 'PELIYAGODA', 'TRUCK', 'REEFER',  'AVAILABLE', 8000, 32, 900, 3.5),
  ('VEH002', 'PELIYAGODA', 'TRUCK', 'AMBIENT', 'AVAILABLE', 9000, 38, 950, 3.8),
  ('VEH003', 'PELIYAGODA', 'VAN',   'REEFER',  'AVAILABLE', 1800, 10, 500, 7.0),
  ('VEH004', 'KANDY',      'TRUCK', 'AMBIENT', 'AVAILABLE', 9000, 38, 950, 3.8);
