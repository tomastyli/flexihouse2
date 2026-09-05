CREATE TABLE IF NOT EXISTS poptavky (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vzniklo TEXT NOT NULL,
  typ TEXT NOT NULL,
  jmeno TEXT NOT NULL,
  email TEXT,
  telefon TEXT NOT NULL,
  model TEXT,
  zprava TEXT,
  konfigurace TEXT,
  cena INTEGER,
  zdroj TEXT,
  relace_kod TEXT,
  mail_odeslan INTEGER NOT NULL DEFAULT 0,
  mail_chyba TEXT,
  vyrizeno INTEGER NOT NULL DEFAULT 0,
  vyrizeno_kdy TEXT
);

CREATE INDEX IF NOT EXISTS poptavky_vzniklo ON poptavky (vzniklo DESC);
CREATE INDEX IF NOT EXISTS poptavky_typ ON poptavky (typ);

CREATE TABLE IF NOT EXISTS prihlaseni (
  ip TEXT PRIMARY KEY,
  pokusy INTEGER NOT NULL DEFAULT 0,
  blokovano_do INTEGER
);

CREATE TABLE IF NOT EXISTS relace (
  kod TEXT PRIMARY KEY,
  vzniklo TEXT NOT NULL,
  typ TEXT NOT NULL,
  model TEXT,
  obsah TEXT NOT NULL,
  cena INTEGER,
  souhrn TEXT,
  ip_hash TEXT,
  zobrazeni INTEGER NOT NULL DEFAULT 0,
  naposledy TEXT
);

CREATE INDEX IF NOT EXISTS relace_vzniklo ON relace (vzniklo DESC);
CREATE INDEX IF NOT EXISTS relace_typ ON relace (typ);
CREATE INDEX IF NOT EXISTS relace_ip ON relace (ip_hash, vzniklo);

-- Migrace pro existující databáze (na ostré provedeno 6. 9. 2026):
-- ALTER TABLE poptavky ADD COLUMN relace_kod TEXT;
