const fs = require("fs");
const { Readable } = require("stream");

const originalCreateReadStream = fs.createReadStream.bind(fs);

fs.createReadStream = function themedCreateReadStream(filePath, options) {
  const normalized = String(filePath).replace(/\\/g, "/");
  if (normalized.endsWith("world_blue_marble_lan.html")) {
    let html = fs.readFileSync(filePath, "utf8");
    if (!html.includes("assets/ui-polish.css")) {
      html = html.replace("</head>", "  <link rel=\"stylesheet\" href=\"/assets/ui-polish.css?v=theme-20260703b\">\n</head>");
    }
    if (!html.includes("assets/ui-polish.js")) {
      html = html.replace("</body>", "  <script src=\"/assets/ui-polish.js?v=theme-20260703b\"></script>\n</body>");
    }
    return Readable.from([html]);
  }
  return originalCreateReadStream(filePath, options);
};

require("./world_blue_marble_lan_server.js");
