CREATE TABLE IF NOT EXISTS poradce_zpravy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  relace TEXT NOT NULL,
  vzniklo TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS poradce_zpravy_relace ON poradce_zpravy (relace, id);
CREATE INDEX IF NOT EXISTS poradce_zpravy_vzniklo ON poradce_zpravy (vzniklo DESC);

CREATE TABLE IF NOT EXISTS poradce_limit (
  klic TEXT PRIMARY KEY,
  pocet INTEGER NOT NULL DEFAULT 0,
  do_kdy INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS poradce_limit_do_kdy ON poradce_limit (do_kdy);
