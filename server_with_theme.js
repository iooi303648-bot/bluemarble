const fs = require("fs");
const path = require("path");
const Module = require("module");
const { Readable } = require("stream");

const originalCreateReadStream = fs.createReadStream.bind(fs);
const THEME_VERSION = "theme-20260703j";
const THEME_CSS = [
  "ui-polish.css",
  "ui-compact-play.css",
  "ui-live-panel.css",
  "ui-lobby-compact.css",
  "ui-dice-button.css"
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

const serverPath = path.join(__dirname, "world_blue_marble_lan_server.js");
let serverSource = fs.readFileSync(serverPath, "utf8");
const patchedStartBlock = `  if (action === "start") {
    if (!["lobby", "finished"].includes(state.phase)) return {};
    if (state.players.length < 2) throw new Error("2명 이상 참가해야 시작할 수 있습니다.");
    const keptPlayers = state.players.map((pl, idx) => ({
      ...pl,
      color: colors[idx % colors.length],
      pos: 0,
      score: 0,
      stamps: [],
      continents: [],
      slow: false,
      island: 0,
      hasIslandEscape: false,
      spaceTravel: false,
      loanUsed: false,
      loanAmount: 0,
      loanTurnsLeft: 0,
      bankrupt: false
    }));
    Object.assign(state, freshState(state.roomCode));
    state.players = keptPlayers;
    const startMoney = state.players.length <= 2 ? 586 : 293;
    state.players.forEach(pl => { pl.score = startMoney; });
    state.phase = "playing";
    state.secondsLeft = 20 * 60;
    state.current = 0;
    state.rolled = false;
    log("여행을 다시 시작했습니다.");
    log(`1인당 시작 자금 ${startMoney}.`);
    startTimer();
    return {};
  }

  if (action === "finish") {`;
serverSource = serverSource.replace(/  if \(action === "start"\) \{[\s\S]*?\n  if \(action === "finish"\) \{/, patchedStartBlock);

const serverModule = new Module(serverPath, module);
serverModule.filename = serverPath;
serverModule.paths = Module._nodeModulePaths(__dirname);
serverModule._compile(serverSource, serverPath);
