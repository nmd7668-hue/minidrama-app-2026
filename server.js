const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT || "8080", 10);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      // Allow Google Sites (sites.google.com) to embed this app cleanly in an iframe
      "Content-Security-Policy": "frame-ancestors *;",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", app: "MiniDrama" }));
    return;
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let targetPath = path.join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);

  if (!targetPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(targetPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, targetPath);
    } else if (!err && stats.isDirectory()) {
      sendFile(res, path.join(targetPath, "index.html"));
    } else {
      sendFile(res, path.join(PUBLIC_DIR, "index.html"));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MiniDrama Web App listening on http://0.0.0.0:${PORT}`);
});
