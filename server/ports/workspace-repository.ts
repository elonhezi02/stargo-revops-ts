import type { State } from "../../shared/contracts.js";
export class ConflictError extends Error {}
export interface WorkspaceRepository {
  read(): State;
  update<T>(action: (s: State) => Promise<T> | T): Promise<T>;
}
