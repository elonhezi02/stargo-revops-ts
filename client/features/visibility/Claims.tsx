import React from "react";
import type { Claim } from "../../../shared/contracts";
export function Claims({ rows }: { rows: Claim[] }) {
  return (
    <p>
      {rows.map((c, i) => (
        <React.Fragment key={i}>
          {c.text} <sup>{c.source_id}</sup>{" "}
        </React.Fragment>
      ))}
    </p>
  );
}
