UPDATE "Actividad"
SET "activo" = true
WHERE LOWER("nombre") IN (
  LOWER('Basquet'),
  LOWER('Voley'),
  LOWER('Taekwondo'),
  LOWER('Pelota-Paleta')
);

INSERT INTO "Actividad" ("nombre", "monto", "activo", "createdAt")
SELECT 'Basquet', 0, true, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Actividad" WHERE LOWER("nombre") = LOWER('Basquet')
);

INSERT INTO "Actividad" ("nombre", "monto", "activo", "createdAt")
SELECT 'Voley', 0, true, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Actividad" WHERE LOWER("nombre") = LOWER('Voley')
);

INSERT INTO "Actividad" ("nombre", "monto", "activo", "createdAt")
SELECT 'Taekwondo', 0, true, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Actividad" WHERE LOWER("nombre") = LOWER('Taekwondo')
);

INSERT INTO "Actividad" ("nombre", "monto", "activo", "createdAt")
SELECT 'Pelota-Paleta', 0, true, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Actividad" WHERE LOWER("nombre") = LOWER('Pelota-Paleta')
);
