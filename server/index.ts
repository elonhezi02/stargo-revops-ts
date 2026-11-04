import { createApp } from "./app.js";
import { config } from "./config.js";
const { app, store } = await createApp();
const port = config().port;
const server = app.listen(port, "127.0.0.1", () =>
  console.log(
    `Revenue workspace: http://127.0.0.1:${port} (${config().provider})`,
  ),
);
server.on("error", (e) => {
  console.error(
    (e as NodeJS.ErrnoException).code === "EADDRINUSE"
      ? `Port ${port} is occupied. Open the existing app or set PORT to another value.`
      : "Server startup failed",
  );
  store.close();
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      store.close();
      process.exit(0);
    }),
  );
