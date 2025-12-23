import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./badge.module.css";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={clsx(styles.badge, styles[variant], className)}
      {...props}
    />
  );
}
