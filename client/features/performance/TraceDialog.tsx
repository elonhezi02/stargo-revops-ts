import type { Trace } from "../../../shared/contracts";
import { ChevronRight } from "lucide-react";
import { Dialog } from "../../components/Dialog";
import { date } from "../../lib/date";
export type TraceSelection = { title: string; rows: Trace[] };
export function TraceDialog({
  records,
  onClose,
  onSelect,
}: {
  records: TraceSelection;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <Dialog title={records.title} close={() => onClose()}>
      {records.rows.length ? (
        records.rows.map((r) => (
          <button
            className="trace"
            key={r.id}
            onClick={() => {
              onClose();
              onSelect(r.contact_id);
            }}
          >
            <strong>{r.name}</strong>
            <span>
              {r.id} · {date(r.at)}
            </span>
            <ChevronRight size={16} />
          </button>
        ))
      ) : (
        <p>No observed records. A missing source feed remains unknown.</p>
      )}
    </Dialog>
  );
}
