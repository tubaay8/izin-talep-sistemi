-- Test amacli demo Yonetici hesabi. Sifre: sifre123
-- Admin kullanici yonetimi ozelligi eklenince bu manuel seed kaldirilabilir.
INSERT INTO users (full_name, email, password, role_id, department_id, manager_id)
SELECT 'Demo Yonetici', 'yonetici@example.com', '$2b$10$hbCH4M3cZFJ46kqvXk3ogey86PJT9g7my4G6RIga7I/E/4wNkpdQ.', r.id, d.id, NULL
FROM roles r, departments d
WHERE r.name = 'Yonetici' AND d.name = 'Bilgi Islem'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
