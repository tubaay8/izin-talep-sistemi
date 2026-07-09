-- Mevcut test personelini demo yoneticiye bagla (test verisi).
UPDATE users u
JOIN users m ON m.email = 'yonetici@example.com'
SET u.manager_id = m.id
WHERE u.email IN ('test@example.com', 'ikinci@example.com');
