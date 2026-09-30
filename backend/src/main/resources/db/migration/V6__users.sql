INSERT INTO app_user(id, email, password_hash, role, outlet_id, depot_id, vehicle_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'store@waypoint.lk', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STORE_MANAGER', 'OUT001', 'PELIYAGODA', NULL),
  ('00000000-0000-0000-0000-000000000002', 'dispatcher@waypoint.lk', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DISPATCHER', NULL, 'PELIYAGODA', NULL),
  ('00000000-0000-0000-0000-000000000003', 'loader@waypoint.lk', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'LOADER', NULL, 'PELIYAGODA', NULL),
  ('00000000-0000-0000-0000-000000000004', 'driver@waypoint.lk', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DRIVER', NULL, 'PELIYAGODA', 'VEH001');
