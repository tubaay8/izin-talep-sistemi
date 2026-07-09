-- Test amacli demo Admin hesabi. Sifre: sifre123
INSERT INTO users (full_name, email, password, role_id, department_id, manager_id)
SELECT 'Demo Admin', 'admin@example.com', '$2b$10$hbCH4M3cZFJ46kqvXk3ogey86PJT9g7my4G6RIga7I/E/4wNkpdQ.', r.id, d.id, NULL
FROM roles r, departments d
WHERE r.name = 'Admin' AND d.name = 'Insan Kaynaklari'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
