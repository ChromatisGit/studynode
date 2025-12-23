/**
 * Core curriculum domain types
 * 
 * Represents the hierarchical structure of educational content:
 * Subject → Topic → Chapter → Worksheet
 */

export interface Worksheet {
  id: string;
  name: string;
  slug: string;
  visible?: boolean; // Admin-controlled visibility for non-admin users
}

export interface Chapter {
  id: string;
  name: string;
  slug: string;
  worksheets: Worksheet[];
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  topics: Topic[];
}