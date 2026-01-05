export type CourseColor = "purple" | "blue" | "green" | "orange" | "teal" | "red";

export type Course = {
  id: string;
  group: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  icon?: string;
  color: CourseColor;
  isListed: boolean;
  isPublic: boolean;
};
