import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import {
  WorkspaceLayout,
  type WorkspaceView,
} from "./components/WorkspaceLayout";
import { Dialog } from "./components/Dialog";
import { useWorkspace } from "./hooks/useWorkspace";
import { workspaceApi } from "./api/workspace";
import { LeadQueue } from "./features/leads/LeadQueue";
import { LeadDetail } from "./features/leads/LeadDetail";
import { NewInboundDialog } from "./features/leads/NewInboundDialog";
import { PerformancePage } from "./features/performance/PerformancePage";
import {
  TraceDialog,
  type TraceSelection,
} from "./features/performance/TraceDialog";
import { VisibilityPage } from "./features/visibility/VisibilityPage";
export function App() {
  const { data, error, setError, busy, refresh, run } = useWorkspace();
  const [view, setView] = useState<WorkspaceView>("queue");
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [records, setRecords] = useState<TraceSelection | null>(null);
  if (!data)
    return (
      <main className="loading">
        <Sparkles />
        <h1>Revenue workspace</h1>
        <p>{error || "Loading local workspace…"}</p>
        {error && <button onClick={refresh}>Retry</button>}
      </main>
    );
  const lead = data.leads.find((l) => l.id === selected);
  return (
    <>
      <WorkspaceLayout
        view={view}
        setView={setView}
        provider={data.provider}
        model={data.model}
        onAdd={() => setAdding(true)}
      >
        {error && (
          <div role="alert" className="notice error">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}
        {view === "queue" && <LeadQueue data={data} onSelect={setSelected} />}
        {view === "performance" && (
          <PerformancePage data={data} setRecords={setRecords} />
        )}
        {view === "visibility" && (
          <VisibilityPage
            data={data}
            busy={busy}
            onGenerate={() => run(workspaceApi.generateBrief)}
          />
        )}
      </WorkspaceLayout>
      {lead && (
        <Dialog title={lead.name} close={() => setSelected(null)}>
          <LeadDetail
            lead={lead}
            busy={busy}
            onReanalyze={async () => {
              await run(() => workspaceApi.reanalyze(lead.id));
            }}
            onDecide={async (body) => {
              await run(() => workspaceApi.decide(lead.id, body));
            }}
            error={error}
          />
        </Dialog>
      )}
      {adding && (
        <NewInboundDialog
          onClose={() => setAdding(false)}
          onSubmit={(body) => run(() => workspaceApi.addLead(body))}
          busy={busy}
          error={error}
        />
      )}
      {records && (
        <TraceDialog
          records={records}
          onClose={() => setRecords(null)}
          onSelect={setSelected}
        />
      )}
    </>
  );
}
