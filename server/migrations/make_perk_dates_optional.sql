-- Make validFrom and validUntil optional in perks table
ALTER TABLE perks ALTER COLUMN valid_from DROP NOT NULL;
ALTER TABLE perks ALTER COLUMN valid_until DROP NOT NULL;
