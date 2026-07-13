-- Yoneticiler organizasyonel olarak Insan Kaynaklari departmaninda gorunur.
UPDATE users u
JOIN roles r ON r.id = u.role_id
JOIN departments d ON d.name = 'Insan Kaynaklari'
SET u.department_id = d.id
WHERE r.name = 'Yonetici';

-- Demo yonetici, yonettigi Bilgi Islem departmaninin resmi yoneticisi olarak isaretlenir.
UPDATE departments d
JOIN users m ON m.email = 'yonetici@example.com'
SET d.manager_id = m.id
WHERE d.name = 'Bilgi Islem';
