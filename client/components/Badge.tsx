import type { ReactNode } from "react";
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={"badge " + String(children).replaceAll(" ", "-").toLowerCase()}
    >
      {children}
    </span>
  );
}
