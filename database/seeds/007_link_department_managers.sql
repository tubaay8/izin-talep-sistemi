-- Demo yonetici, yonettigi Bilgi Islem departmaninin resmi yoneticisi olarak isaretlenir.
-- (Not: bir departmanin yoneticisi, kendisi de o departmanin bir uyesi olmalidir;
-- bu yuzden burada tum yoneticileri tek bir departmana toplayan eski adim kaldirildi.)
UPDATE departments d
JOIN users m ON m.email = 'yonetici@example.com'
SET d.manager_id = m.id
WHERE d.name = 'Bilgi Islem';
