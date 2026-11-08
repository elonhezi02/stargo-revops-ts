import type { Workspace } from "../../shared/contracts";
import { api } from "./http";
export const workspaceApi = {
  read: () => api<Workspace>("/workspace"),
  addLead: (body: unknown) => api<{ contact_id: string }>("/leads", body),
  reanalyze: (id: string) =>
    api("/leads/" + encodeURIComponent(id) + "/reanalyze", {}),
  decide: (id: string, body: unknown) =>
    api("/leads/" + encodeURIComponent(id) + "/decisions", body),
  generateBrief: () => api("/visibility/brief", {}),
};
