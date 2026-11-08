import type { ReactNode } from "react";
import {
  BarChart3,
  ChevronRight,
  Download,
  Inbox,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "./Badge";
export type WorkspaceView = "queue" | "performance" | "visibility";
export function WorkspaceLayout({
  view,
  setView,
  provider,
  model,
  onAdd,
  children,
}: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  provider: string;
  model: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="/">
          stargo<span>REV OPS</span>
        </a>
        <div className="workspace-label">REVENUE WORKSPACE</div>
        <nav>
          {[
            ["queue", "Lead queue", Inbox],
            ["performance", "Weekly performance", BarChart3],
            ["visibility", "AI visibility", Sparkles],
          ].map(([id, label, Icon]) => {
            const I = Icon as typeof Inbox;
            return (
              <button
                key={String(id)}
                className={view === id ? "active" : ""}
                aria-current={view === id ? "page" : undefined}
                onClick={() => setView(id as WorkspaceView)}
              >
                <I size={19} />
                {String(label)}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="dot" /> Local workspace
          <p>
            Synthetic assignment data
            <br />
            Nothing is sent automatically.
          </p>
        </div>
      </aside>
      <div className="content">
        <header>
          <span>
            GTM OPERATIONS <ChevronRight size={13} />{" "}
            {view === "queue"
              ? "Lead queue"
              : view === "performance"
                ? "Performance"
                : "Visibility"}
          </span>
          <Badge>{provider === "rules" ? "Offline rules" : model}</Badge>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {view === "queue"
                  ? "FROM SIGNAL TO CONVERSATION"
                  : view === "performance"
                    ? "4–8 OCTOBER 2026 · ISRAEL TIME"
                    : "HOW BUYERS DISCOVER STARGO"}
              </div>
              <h1>
                {view === "queue"
                  ? "Every signal. A clear next step."
                  : view === "performance"
                    ? "An honest view of the week."
                    : "Turn visibility gaps into answers."}
              </h1>
              <p>
                {view === "queue"
                  ? "Evidence-backed qualification, with people in control."
                  : view === "performance"
                    ? "Observed results, traceable to the decisions and events behind them."
                    : "A snapshot of 24 synthetic answers across three AI engines."}
              </p>
            </div>
            {view === "queue" ? (
              <button className="primary" onClick={() => onAdd()}>
                <Plus size={17} />
                New inbound
              </button>
            ) : view === "performance" ? (
              <a className="button" href="/api/kpi/export">
                <Download size={17} />
                Export pack
              </a>
            ) : null}
          </div>
          {children}
        </main>
        <footer>
          Stargo revenue workspace · Local, evidence-led, human-approved
        </footer>
      </div>
    </div>
  );
}
