import { LayoutGrid, GraduationCap, Network, LucideIcon } from 'lucide-react';

export interface AboutGoal {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const aboutGoals: AboutGoal[] = [
  {
    id: 'clear-structure',
    icon: LayoutGrid,
    title: 'Klare Strukturen',
    description: 'Alle Materialien und Aufgaben sind übersichtlich organisiert.',
  },
  {
    id: 'for-students',
    icon: GraduationCap,
    title: 'Für meine Schüler',
    description: 'Ergänzt den Unterricht und unterstützt beim eigenständigen Lernen.',
  },
  {
    id: 'connected-knowledge',
    icon: Network,
    title: 'Vernetztes Wissen',
    description: 'Ermöglicht Zusammenhänge zu erkennen und Verbindungen zu verstehen.',
  },
];
