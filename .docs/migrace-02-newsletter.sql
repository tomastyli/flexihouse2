CREATE TABLE IF NOT EXISTS newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  vzniklo TEXT NOT NULL,
  zdroj TEXT,
  ip_hash TEXT,
  odhlasovaci_kod TEXT NOT NULL,
  odhlaseno TEXT
);

CREATE INDEX IF NOT EXISTS newsletter_vzniklo ON newsletter (vzniklo);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_kod ON newsletter (odhlasovaci_kod);
