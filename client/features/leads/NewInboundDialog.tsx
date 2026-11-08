import { Sources } from "../../../shared/contracts";
import { Dialog } from "../../components/Dialog";
export function NewInboundDialog({
  onClose,
  onSubmit,
  busy,
  error,
}: {
  onClose: () => void;
  onSubmit: (body: unknown) => Promise<boolean>;
  busy: boolean;
  error: string;
}) {
  return (
    <Dialog title="New inbound signal" close={() => onClose()}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const body = {
            from_name: f.get("name"),
            from_email: f.get("email") || null,
            linkedin_url: f.get("linkedin") || null,
            channel: f.get("channel"),
            source: f.get("source") || null,
            body: f.get("body"),
            ...(f.get("received") ? { received_at: f.get("received") } : {}),
          };
          if (await onSubmit(body)) onClose();
        }}
      >
        <p className="muted">
          Use the same qualification pipeline as the seed data. Identity fields
          may be blank.
        </p>
        <label>
          Name
          <input name="name" required maxLength={200} />
        </label>
        <div className="columns">
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <label>
            LinkedIn profile URL
            <input name="linkedin" type="url" />
          </label>
        </div>
        <div className="columns">
          <label>
            Channel
            <select name="channel">
              <option value="form_fill">Form</option>
              <option value="email_reply">Email reply</option>
              <option value="linkedin_dm">LinkedIn DM</option>
            </select>
          </label>
          <label>
            First-touch source
            <select name="source">
              <option value="">Not recorded</option>
              {Sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Received time (optional, ISO with offset)
          <input name="received" placeholder="2026-10-05T12:00:00+03:00" />
        </label>
        <label>
          Original message
          <textarea name="body" required rows={6} maxLength={12000} />
        </label>
        {error && (
          <p role="alert" className="warning">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? "Analyzing…" : "Add and analyze"}
        </button>
      </form>
    </Dialog>
  );
}
