import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

import styles from "./button.module.css";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      {...props}
    />
  );
}
