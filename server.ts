import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import chatHandler from "./api/chat";

const app = express();
app.use(express.json());

const PORT = 3000;

app.all("/api/chat", async (req, res) => {
  await chatHandler(req, res);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
