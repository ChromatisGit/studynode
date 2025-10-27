import type { ComponentProps } from "react";
import DocCard from "@theme/DocCard";
import Link from "@docusaurus/Link";
import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

type DocCardItem = ComponentProps<typeof DocCard>["item"];

const FILE_EXT = /\.(pdf|zip)$/i;

export default function DocCardSmartLink({
  href,
  label,
  description,
  col = 6,
}: {
  href: string;          // /pfad/zur/seite oder /pdf/.. oder https://...
  label: string;
  description?: string;
  col?: number;
}) {
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);
  const isFile = FILE_EXT.test(href);
  const resolved = isExternal ? href : useBaseUrl(href);

  // 1) Dateien/Externals: echte <a>-Card => kein SPA, kein 404
  if (isExternal || isFile) {
    return (
      <div className={`col col--${col}`} style={{ marginBottom: "1rem" }}>
        <a
          href={resolved}
          target="_blank"
          rel="noopener noreferrer"
          className="card padding--md"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div className="card__header"><h3>{label}</h3></div>
          {description && <div className="card__body">{description}</div>}
        </a>
      </div>
    );
  }

  // 2) Interne MDX/Seiten: echtes DocCard (SPA okay)
  const item: DocCardItem = { type: "link", href: resolved, label, description };
  return (
    <div className={`col col--${col}`} style={{ marginBottom: "1rem" }}>
      <DocCard item={item} />
    </div>
  );
}