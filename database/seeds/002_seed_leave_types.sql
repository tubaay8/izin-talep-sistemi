-- counts_toward_quota burada dogrudan verilir: migration 011'deki UPDATE,
-- migration'lar seed'lerden ONCE calistigi icin bu satirlar henuz mevcut
-- degilken devreye girip hicbir satiri etkilemiyordu (sifirdan kurulumda
-- Yillik Izin'in kota kontrolu hic tetiklenmiyordu). Deger artik dogrudan
-- burada, ekleme anindan itibaren dogru olacak sekilde set ediliyor.
INSERT INTO leave_types (name, description, counts_toward_quota, is_hourly) VALUES
  ('Yıllık İzin', 'Yıllık ücretli izin hakkı', 1, 0),
  ('Mazeret izni', 'Kısa süreli mazeret izni', 0, 0),
  ('Hastalık izni', 'Sağlık raporuna dayalı izin', 0, 0),
  ('Saatlik İzin', 'Ayni gun icinde saat araligi ile alinan izin (9 saat = 1 gun, yillik izin bakiyesinden dusulur)', 1, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description), counts_toward_quota = VALUES(counts_toward_quota), is_hourly = VALUES(is_hourly);
