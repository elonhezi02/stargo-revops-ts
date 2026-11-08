import { useEffect, useState } from "react";
import type { Workspace } from "../../shared/contracts";
import { workspaceApi } from "../api/workspace";
export function useWorkspace() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    try {
      setData(await workspaceApi.read());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { data, error, setError, busy, refresh, run };
}
