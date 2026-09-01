CREATE TABLE poptavky_nove (
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
  mail_odeslan INTEGER NOT NULL DEFAULT 0,
  mail_chyba TEXT
);

INSERT INTO poptavky_nove
  (id, vzniklo, typ, jmeno, email, telefon, model, zprava, konfigurace, cena, zdroj, mail_odeslan, mail_chyba)
SELECT
  id, vzniklo, typ, jmeno, NULLIF(email, ''), telefon, model, zprava, konfigurace, cena, zdroj, mail_odeslan, mail_chyba
FROM poptavky;

DROP TABLE poptavky;

ALTER TABLE poptavky_nove RENAME TO poptavky;

CREATE INDEX IF NOT EXISTS poptavky_vzniklo ON poptavky (vzniklo DESC);
CREATE INDEX IF NOT EXISTS poptavky_typ ON poptavky (typ);
