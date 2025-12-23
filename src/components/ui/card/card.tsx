import clsx from "clsx";
import type { ComponentProps } from "react";

import styles from "./card.module.css";

type CardProps = ComponentProps<"div">;

function Card({ className, ...props }: CardProps) {
  return (
    <div data-slot="card" className={clsx(styles.card, className)} {...props} />
  );
}

type CardHeaderProps = ComponentProps<"div"> & {
  withBorder?: boolean;
};

function CardHeader({ className, withBorder, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={clsx(styles.header, withBorder ? styles.headerBorder : null, className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 data-slot="card-title" className={clsx(styles.title, className)} {...props} />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-action" className={clsx(styles.action, className)} {...props} />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={clsx(styles.content, className)} {...props} />
  );
}

type CardFooterProps = ComponentProps<"div"> & {
  withBorder?: boolean;
};

function CardFooter({ className, withBorder, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={clsx(styles.footer, withBorder ? styles.footerBorder : null, className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
export type { CardProps, CardHeaderProps, CardFooterProps };
