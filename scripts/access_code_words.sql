CREATE TABLE IF NOT EXISTS access_code_words (
  pos  INTEGER PRIMARY KEY CHECK (pos >= 0),
  word TEXT NOT NULL UNIQUE
);

INSERT INTO access_code_words (pos, word)
VALUES
  (0, 'alpha'),
  (1, 'bravo'),
  (2, 'cinder'),
  (3, 'delta'),
  (4, 'ember')
ON CONFLICT (pos) DO UPDATE
SET word = EXCLUDED.word;
