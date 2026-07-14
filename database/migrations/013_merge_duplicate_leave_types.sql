-- Farkli zamanlarda calisan seed'ler yuzunden ayni izin turunun hem eski
-- (bozuk Turkce karakterli) hem duzgun kayitli hali ayri satirlar olarak
-- birikmisti. Bu migration onlari tek, dogru yazili kayda birlestirir.

-- Yillik Izin: tek kayit kaldiysa adini/aciklamasini duzelt.
UPDATE leave_types
SET name = 'Yıllık İzin', description = 'Yıllık ücretli izin hakkı'
WHERE name = 'Yillik Izin';

-- Mazeret izni: eski kaydin talepleri varsa dogru kayda tasi, eski kaydi sil.
UPDATE leave_requests lr
JOIN leave_types old_lt ON old_lt.id = lr.leave_type_id AND old_lt.name = 'Mazeret Izni'
JOIN leave_types new_lt ON new_lt.name = 'Mazeret izni'
SET lr.leave_type_id = new_lt.id;

DELETE FROM leave_types WHERE name = 'Mazeret Izni';

-- Hastalik izni: eski kaydin talepleri varsa dogru kayda tasi, eski kaydi sil.
UPDATE leave_requests lr
JOIN leave_types old_lt ON old_lt.id = lr.leave_type_id AND old_lt.name = 'Hastalik Izni'
JOIN leave_types new_lt ON new_lt.name = 'Hastalık izni'
SET lr.leave_type_id = new_lt.id;

DELETE FROM leave_types WHERE name = 'Hastalik Izni';
