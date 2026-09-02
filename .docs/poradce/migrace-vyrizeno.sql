ALTER TABLE poptavky ADD COLUMN vyrizeno INTEGER NOT NULL DEFAULT 0;
ALTER TABLE poptavky ADD COLUMN vyrizeno_kdy TEXT;

CREATE INDEX IF NOT EXISTS poptavky_vyrizeno ON poptavky (vyrizeno, vzniklo DESC);
