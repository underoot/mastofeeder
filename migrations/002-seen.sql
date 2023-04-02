--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE seen (
  hostname  TEXT    NOT NULL,
  id        TEXT PRIMARY KEY,
  CONSTRAINT seen_hostname_id_key UNIQUE (hostname, id)
);


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE seen;