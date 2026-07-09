INSERT INTO leave_types (name, description) VALUES
  ('Yıllık İzin', 'Yıllık ücretli izin hakkı'),
  ('Mazeret izni', 'Kısa süreli mazeret izni'),
  ('Hastalık izni', 'Sağlık raporuna dayalı izin')
ON DUPLICATE KEY UPDATE description = VALUES(description);
