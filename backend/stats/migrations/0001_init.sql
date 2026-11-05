CREATE TABLE visitors (id TEXT PRIMARY KEY);
CREATE TABLE views (id TEXT PRIMARY KEY, path TEXT NOT NULL, visitor TEXT NOT NULL);
CREATE INDEX views_by_path ON views(path);
CREATE TRIGGER record_visitor AFTER INSERT ON views
BEGIN
  INSERT OR IGNORE INTO visitors(id) VALUES (NEW.visitor);
END;
