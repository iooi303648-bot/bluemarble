const fs = require("fs");
const { Readable } = require("stream");

const originalCreateReadStream = fs.createReadStream.bind(fs);
const THEME_VERSION = "theme-20260703e";
const THEME_CSS = [
  "ui-polish.css",
  "ui-compact-play.css",
  "ui-live-panel.css",
  "ui-lobby-compact.css"
];

function cssTag(file) {
  return `  <link rel="stylesheet" href="/assets/${file}?v=${THEME_VERSION}">`;
}

fs.createReadStream = function themedCreateReadStream(filePath, options) {
  const normalized = String(filePath).replace(/\\/g, "/");
  if (normalized.endsWith("world_blue_marble_lan.html")) {
    let html = fs.readFileSync(filePath, "utf8");
    const missingCss = THEME_CSS.filter(file => !html.includes(`assets/${file}`));
    if (missingCss.length) {
      html = html.replace("</head>", `${missingCss.map(cssTag).join("\n")}\n</head>`);
    }
    if (!html.includes("assets/ui-polish.js")) {
      html = html.replace("</body>", `  <script src="/assets/ui-polish.js?v=${THEME_VERSION}"></script>\n</body>`);
    }
    return Readable.from([html]);
  }
  return originalCreateReadStream(filePath, options);
};

require("./world_blue_marble_lan_server.js");
