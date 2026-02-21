CREATE OR REPLACE VIEW v_worksheets_by_chapter AS
SELECT
  cw.course_id,
  cw.topic_id,
  cw.chapter_id,
  cw.worksheet_id,
  w.label,
  CONCAT(
    '/', g.group_key, '/', s.subject_key, '/',
    t.href_slug, '/', ch.href_slug, '/', w.href_slug
  )                   AS href,
  w.worksheet_format,
  cw.is_hidden,
  cw.display_order
FROM course_worksheets cw
JOIN worksheets w  ON w.worksheet_id  = cw.worksheet_id
JOIN courses c     ON c.course_id     = cw.course_id
JOIN groups g      ON g.group_id      = c.group_id
JOIN subjects s    ON s.subject_id    = c.subject_id
JOIN topics t      ON t.topic_id      = cw.topic_id
JOIN chapters ch   ON ch.chapter_id   = cw.chapter_id;
