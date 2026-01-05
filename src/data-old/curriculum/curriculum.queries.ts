/**
 * Curriculum query functions
 * 
 * Pure functions for retrieving curriculum data.
 * No side effects, no mutations.
 */

import { Subject, Topic, Chapter } from './curriculum.types';
import { SUBJECTS } from './curriculum.data';

/**
 * Get all subjects
 */
export function getAllSubjects(): Subject[] {
  return SUBJECTS;
}

/**
 * Find a subject by its slug
 */
export function findSubjectBySlug(slug: string): Subject | null {
  return SUBJECTS.find(s => s.slug === slug) || null;
}

/**
 * Find a topic within a subject
 */
export function findTopic(subjectSlug: string, topicSlug: string): Topic | null {
  const subject = findSubjectBySlug(subjectSlug);
  if (!subject) return null;
  
  return subject.topics.find(t => t.slug === topicSlug) || null;
}

/**
 * Find a chapter within a subject and topic
 */
export function findChapter(
  subjectSlug: string,
  topicSlug: string,
  chapterSlug: string
): Chapter | null {
  const topic = findTopic(subjectSlug, topicSlug);
  if (!topic) return null;
  
  return topic.chapters.find(c => c.slug === chapterSlug) || null;
}
