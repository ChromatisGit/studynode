CREATE OR REPLACE VIEW v_progress_dto AS
SELECT
  ct.course_id,
  ct.topic_id,
  t.label                                                                          AS topic_label,
  CONCAT('/', g.group_key, '/', s.subject_key, '/', t.href_slug)                 AS topic_href,
  ct.status                                                                        AS topic_status,
  ct.display_order                                                                 AS topic_order,
  cc.chapter_id,
  ch.label                                                                         AS chapter_label,
  CONCAT('/', g.group_key, '/', s.subject_key, '/', t.href_slug, '/', ch.href_slug) AS chapter_href,
  cc.status                                                                        AS chapter_status,
  cc.display_order                                                                 AS chapter_order
FROM course_topics ct
JOIN topics t         ON t.topic_id   = ct.topic_id
JOIN courses c        ON c.course_id  = ct.course_id
JOIN groups g         ON g.group_id   = c.group_id
JOIN subjects s       ON s.subject_id = c.subject_id
LEFT JOIN course_chapters cc ON cc.course_id = ct.course_id AND cc.topic_id = ct.topic_id
LEFT JOIN chapters ch        ON ch.chapter_id = cc.chapter_id
ORDER BY ct.display_order, cc.display_order;
