-- Up Migration
INSERT INTO slot_type (name) VALUES
  ('track'),
  ('artist'),
  ('album'),
  ('playlist');
-- Down Migration