-- Bir departmanin yoneticisi, kendisi de o departmanin bir uyesi olmalidir.
-- Eski bir seed adimi (007_link_department_managers.sql) tum yoneticileri
-- her deploy'da zorla "Insan Kaynaklari" departmanina tasiyordu; bu yuzden
-- ornegin Bilgi Islem'in yoneticisi organizasyonel olarak Insan Kaynaklari'nda
-- gorunuyordu. Bu tek seferlik duzeltme, her yoneticinin department_id'sini
-- fiilen yonettigi departmanla eslestirir.
UPDATE users u
JOIN departments d ON d.manager_id = u.id
SET u.department_id = d.id
WHERE u.department_id != d.id;
