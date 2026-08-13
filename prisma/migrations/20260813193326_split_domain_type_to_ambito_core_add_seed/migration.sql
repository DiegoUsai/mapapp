-- Rinominare type -> ambito (con validazione: correggi 'trasversale-core' -> 'trasversale')
UPDATE "Domain" SET "type" = 'trasversale' WHERE "type" = 'trasversale-core';
ALTER TABLE "Domain" RENAME COLUMN "type" TO "ambito";

-- Aggiungere colonna core (dominio non-core di default)
ALTER TABLE "Domain" ADD COLUMN "core" BOOLEAN NOT NULL DEFAULT false;

-- Seed: 8 domini da domini-seed-cofog-eurovoc.json
-- Usare codici COFOG a 2 livelli (es. 01.3, 01.1) coerenti con COFOG_OPTIONS in lib/cofog.js
INSERT INTO "Domain" (id, name, ambito, core, "cofogCode", color, "createdAt")
VALUES
  (gen_random_uuid()::text, 'Gestione documentale e protocollo', 'trasversale', true, '01.3', '#3E5C76', NOW()),
  (gen_random_uuid()::text, 'Identità digitale', 'trasversale', true, '01.3', '#6B4E71', NOW()),
  (gen_random_uuid()::text, 'Pagamenti elettronici', 'trasversale', true, '01.1', '#7A6A3F', NOW()),
  (gen_random_uuid()::text, 'Contabilità e finanza', 'verticale', true, '01.1', '#7A3E3E', NOW()),
  (gen_random_uuid()::text, 'Gestione risorse umane (HR)', 'verticale', false, '01.3', '#4B6B4B', NOW()),
  (gen_random_uuid()::text, 'Anagrafe e stato civile', 'verticale', true, '01.3', '#5B4B7A', NOW()),
  (gen_random_uuid()::text, 'Edilizia e urbanistica (SUE/SUAP)', 'verticale', false, '06.2', '#2F6B6F', NOW()),
  (gen_random_uuid()::text, 'Sistemi informativi sanitari e FSE', 'verticale', true, '07.6', '#7A5A3E', NOW())
ON CONFLICT DO NOTHING;
