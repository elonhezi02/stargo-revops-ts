import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { State } from "../../../shared/contracts.js";
import { seed } from "../data/seed.js";
import { report } from "../../domain/reporting.js";
import {
  ConflictError,
  type WorkspaceRepository,
} from "../../ports/workspace-repository.js";
export class Store implements WorkspaceRepository {
  readonly db: DatabaseSync;
  private tail: Promise<unknown> = Promise.resolve();
  constructor(
    path: string,
    private readonly seedState = seed,
    private readonly buildReport = report,
  ) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000; CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL,document TEXT NOT NULL)",
    );
  }
  async initialize() {
    if (!this.db.prepare("SELECT id FROM workspace WHERE id=1").get()) {
      const s = await this.seedState();
      this.db
        .prepare("INSERT OR IGNORE INTO workspace VALUES(1,?,?)")
        .run(s.revision, JSON.stringify(s));
    }
  }
  read(): State {
    const row = this.db
      .prepare("SELECT document FROM workspace WHERE id=1")
      .get() as { document: string };
    const state = JSON.parse(row.document) as State;
    if (state.version !== 1) throw new Error("Unsupported database version");
    return state;
  }
  update<T>(action: (s: State) => Promise<T> | T): Promise<T> {
    const task = this.tail.then(async () => {
      const s = this.read();
      const revision = s.revision;
      const result = await action(s);
      s.revision++;
      s.pack = this.buildReport(s);
      const write = this.db
        .prepare(
          "UPDATE workspace SET revision=?,document=? WHERE id=1 AND revision=?",
        )
        .run(s.revision, JSON.stringify(s), revision);
      if (write.changes !== 1)
        throw new ConflictError("Workspace changed. Please retry.");
      return result;
    });
    this.tail = task.catch(() => undefined);
    return task;
  }
  close() {
    this.db.close();
  }
}
