-- Hacer nullable los campos establishment_id y card_id para permitir transferencias
ALTER TABLE transactions
ALTER COLUMN establishment_id DROP NOT NULL,
ALTER COLUMN card_id DROP NOT NULL;

-- Opcionalmente, agregar un check constraint para asegurar que al menos uno esté presente
-- (o es una transacción de establecimiento o es una transferencia)
