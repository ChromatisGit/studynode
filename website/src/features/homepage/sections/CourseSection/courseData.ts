import {
  Code,
  Terminal,
  Laptop,
  Database,
  Cpu,
  Binary,
  Calculator,
  PieChart,
  TrendingUp,
  Percent,
  Shapes,
  Ruler,
  LucideIcon,
} from 'lucide-react';
import { type AccentColor } from '@site/src/css/colors';

/**
 * Course type definition
 */
export type CourseType = 'informatik' | 'mathematik';

/**
 * Available color themes for courses
 */
export type CourseColor = AccentColor;

/**
 * Course data structure
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  type: CourseType;
  topics: string[];
  icon?: LucideIcon; // Optional: custom icon overrides automatic selection
}

/**
 * Icon pools by course type
 * Icons automatically rotate based on course index
 */
export const informatikIcons: LucideIcon[] = [Code, Terminal, Laptop, Database, Cpu, Binary];
export const mathematikIcons: LucideIcon[] = [Calculator, PieChart, TrendingUp, Percent, Shapes, Ruler];

/**
 * Color palette that rotates through all courses
 */
export const courseColors: CourseColor[] = ['purple', 'blue', 'green', 'orange', 'teal', 'indigo'];

/**
 * Get icon for a course
 * Uses custom icon if provided, otherwise selects from type-specific pool
 */
export function getCourseIcon(course: Course, index: number): LucideIcon {
  if (course.icon) {
    return course.icon;
  }

  const icons = course.type === 'informatik' ? informatikIcons : mathematikIcons;
  return icons[index % icons.length];
}

/**
 * Get color theme for a course based on its index
 */
export function getCourseColor(index: number): CourseColor {
  return courseColors[index % courseColors.length];
}

export const courses: Course[] = [
  {
    id: 'informatik-1',
    title: 'Grundlagen der Informatik',
    description: 'Einführung in Programmierung und algorithmisches Denken',
    type: 'informatik',
    topics: ['Python', 'Algorithmen', 'Datenstrukturen'],
  },
  {
    id: 'mathematik-1',
    title: 'Analysis',
    description: 'Funktionen, Ableitungen und Integrale',
    type: 'mathematik',
    topics: ['Differentialrechnung', 'Integralrechnung', 'Kurvendiskussion'],
  },
  {
    id: 'informatik-2',
    title: 'Webentwicklung',
    description: 'Moderne Webtechnologien und Frontend-Entwicklung',
    type: 'informatik',
    topics: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    id: 'mathematik-2',
    title: 'Lineare Algebra',
    description: 'Vektoren, Matrizen und lineare Gleichungssysteme',
    type: 'mathematik',
    topics: ['Vektorrechnung', 'Matrizen', 'Lineare Gleichungen'],
  },
];
