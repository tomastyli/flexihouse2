CREATE TABLE IF NOT EXISTS poptavky (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vzniklo TEXT NOT NULL,
  typ TEXT NOT NULL,
  jmeno TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT NOT NULL,
  model TEXT,
  zprava TEXT,
  konfigurace TEXT,
  cena INTEGER,
  zdroj TEXT,
  mail_odeslan INTEGER NOT NULL DEFAULT 0,
  mail_chyba TEXT
);

CREATE INDEX IF NOT EXISTS poptavky_vzniklo ON poptavky (vzniklo DESC);
CREATE INDEX IF NOT EXISTS poptavky_typ ON poptavky (typ);

CREATE TABLE IF NOT EXISTS prihlaseni (
  ip TEXT PRIMARY KEY,
  pokusy INTEGER NOT NULL DEFAULT 0,
  blokovano_do INTEGER
);
