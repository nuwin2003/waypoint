UPDATE app_user
SET password_hash = '$2a$10$YzBLY75xpvKNqPhuUPKXW.7NmLdZVEVz/lvTm4zBcIzK/ni1p1REi'
WHERE email IN (
  'store@waypoint.lk',
  'dispatcher@waypoint.lk',
  'loader@waypoint.lk',
  'driver@waypoint.lk'
)
AND password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LZdL17lhWy';
