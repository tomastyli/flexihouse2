CREATE TABLE IF NOT EXISTS s_zakaznici (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vzniklo TEXT NOT NULL,
  jmeno TEXT NOT NULL,
  telefon TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  misto TEXT NOT NULL DEFAULT '',
  stav TEXT NOT NULL DEFAULT 'novy',
  majitel TEXT,
  web TEXT,
  poptavka_id INTEGER,
  drive_slozka TEXT
);
CREATE INDEX IF NOT EXISTS s_zakaznici_email ON s_zakaznici (email);

CREATE TABLE IF NOT EXISTS s_dodavatele (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nazev TEXT NOT NULL,
  co TEXT NOT NULL DEFAULT '',
  kontakt TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefon TEXT NOT NULL DEFAULT '',
  drive_slozka TEXT
);

CREATE TABLE IF NOT EXISTS s_zpravy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kdy TEXT NOT NULL,
  zak_id INTEGER,
  dod_id INTEGER,
  typ TEXT NOT NULL,
  kdo TEXT,
  text TEXT NOT NULL DEFAULT '',
  predmet TEXT,
  vysledek TEXT,
  prilohy TEXT,
  gmail_id TEXT UNIQUE,
  thread_id TEXT,
  od_adresa TEXT,
  nove INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS s_zpravy_zak ON s_zpravy (zak_id, kdy);
CREATE INDEX IF NOT EXISTS s_zpravy_dod ON s_zpravy (dod_id, kdy);

CREATE TABLE IF NOT EXISTS s_pripominky (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vzniklo TEXT NOT NULL,
  komu TEXT NOT NULL,
  kdy TEXT NOT NULL,
  text TEXT NOT NULL,
  zak_id INTEGER,
  dod_id INTEGER,
  hotovo_kdy TEXT
);

CREATE TABLE IF NOT EXISTS s_zakazky (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zak_id INTEGER NOT NULL,
  model TEXT NOT NULL,
  krok TEXT NOT NULL DEFAULT 'zaloha',
  kontejner TEXT NOT NULL DEFAULT '',
  predani TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS s_nastaveni (
  klic TEXT PRIMARY KEY,
  hodnota TEXT
);

INSERT OR IGNORE INTO s_dodavatele (nazev, co, kontakt, email) VALUES
  ('Výrobce domů', 'Domy a díly', '', ''),
  ('Spedice', 'Kontejnery a clo', '', ''),
  ('Autojeřáby', 'Vykládka a usazení', '', ''),
  ('Doprava z Prahy', 'Převoz na pozemek', '', '');
