-- Admin tarafindan gecici sifreyle olusturulan kullanicilarin ilk giriste
-- sifre degistirmesini zorunlu kilmak icin.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER password;
