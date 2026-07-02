const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT || 8765);
const ROOT = __dirname;

const colors = ["#e44c65", "#1f9d72", "#1677c7", "#f4b63d", "#7b61d1", "#293241"];
const boardSpaces = [
  {type:"start", name:"출발", meta:"한 바퀴마다 3M"},
  {type:"quiz", name:"위도", meta:"적도와 남북 위치"},
  {type:"country", name:"대한민국", continent:"아시아", meta:"반도에 있는 우리나라"},
  {type:"ocean", name:"태평양", meta:"가장 넓은 대양"},
  {type:"country", name:"일본", continent:"아시아", meta:"섬나라"},
  {type:"chance", name:"황금열쇠", meta:"지구본, 지도, 영상"},
  {type:"country", name:"중국", continent:"아시아", meta:"넓은 영토"},
  {type:"quiz", name:"경도", meta:"본초 자오선"},
  {type:"continent", name:"아시아", meta:"가장 큰 대륙"},
  {type:"country", name:"사우디아라비아", continent:"아시아", meta:"건조한 지역"},
  {type:"ocean", name:"인도양", meta:"아시아 남쪽"},
  {type:"country", name:"이집트", continent:"아프리카", meta:"나일강과 사막"},
  {type:"quiz", name:"대륙", meta:"큰 땅덩어리"},
  {type:"country", name:"케냐", continent:"아프리카", meta:"동아프리카"},
  {type:"continent", name:"아프리카", meta:"적도가 지나감"},
  {type:"chance", name:"황금열쇠", meta:"이동 카드"},
  {type:"country", name:"프랑스", continent:"유럽", meta:"유럽 서쪽"},
  {type:"quiz", name:"디지털 지도", meta:"확대와 축소"},
  {type:"country", name:"영국", continent:"유럽", meta:"섬나라"},
  {type:"ocean", name:"대서양", meta:"유럽과 아메리카 사이"},
  {type:"country", name:"미국", continent:"북아메리카", meta:"대서양과 태평양 사이"},
  {type:"continent", name:"북아메리카", meta:"북반구에 넓게 위치"},
  {type:"quiz", name:"영토 특징", meta:"모양과 위치"},
  {type:"country", name:"캐나다", continent:"북아메리카", meta:"북쪽의 넓은 나라"},
  {type:"chance", name:"황금열쇠", meta:"도장 기회"},
  {type:"country", name:"브라질", continent:"남아메리카", meta:"아마존 지역"},
  {type:"continent", name:"남아메리카", meta:"남북으로 길다"},
  {type:"ocean", name:"남극해", meta:"남극 대륙 주변"},
  {type:"continent", name:"남극 대륙", meta:"얼음으로 덮인 대륙"},
  {type:"country", name:"오스트레일리아", continent:"오세아니아", meta:"대륙이자 나라"},
  {type:"quiz", name:"대양", meta:"넓은 바다"},
  {type:"continent", name:"오세아니아", meta:"섬들이 많음"}
];

const cards = [
  {q:"위도는 무엇을 기준으로 남쪽과 북쪽의 위치를 나타낼까요?", a:["적도", "본초 자오선", "날짜 변경선"], c:0, e:"위도는 적도를 기준으로 북위와 남위로 나타냅니다."},
  {q:"경도는 무엇을 기준으로 동쪽과 서쪽의 위치를 나타낼까요?", a:["본초 자오선", "남극점", "태평양"], c:0, e:"경도는 본초 자오선을 기준으로 동경과 서경으로 나타냅니다."},
  {q:"세계 지도에서 위도와 경도는 어떤 일을 도와줄까요?", a:["위치를 더 정확히 찾는다", "날씨를 바꾼다", "나라 이름을 만든다"], c:0, e:"위선과 경선을 이용하면 나라나 도시의 위치를 더 정확히 말할 수 있습니다."},
  {q:"지구본의 좋은 점으로 알맞은 것은?", a:["지구의 둥근 모양을 실제와 비슷하게 볼 수 있다", "모든 지역을 한눈에 자세히 볼 수 있다", "계속 확대할 수 있다"], c:0, e:"지구본은 지구의 둥근 모양과 위치 관계를 이해하는 데 좋습니다."},
  {q:"세계 지도의 좋은 점으로 알맞은 것은?", a:["세계 여러 지역을 한눈에 볼 수 있다", "지구가 실제로 평평하다는 것을 보여 준다", "높이를 정확히 만져 볼 수 있다"], c:0, e:"세계 지도는 넓은 지역을 한눈에 비교하기 좋습니다."},
  {q:"디지털 공간 영상 정보의 특징으로 알맞은 것은?", a:["확대, 축소, 이동하며 위치를 살펴볼 수 있다", "종이에 한 번 그리면 바꿀 수 없다", "위도와 경도를 사용할 수 없다"], c:0, e:"디지털 지도와 위성 영상은 확대와 축소, 검색, 거리 확인 등에 활용됩니다."},
  {q:"대륙은 무엇을 뜻할까요?", a:["바다로 둘러싸인 아주 큰 땅덩어리", "작은 강", "나라의 수도"], c:0, e:"대륙은 지구 표면의 아주 큰 땅덩어리입니다."},
  {q:"대양은 무엇을 뜻할까요?", a:["대륙 사이에 펼쳐진 넓은 바다", "산맥", "도시의 길"], c:0, e:"태평양, 대서양, 인도양처럼 큰 바다를 대양이라고 합니다."},
  {q:"세계에서 가장 넓은 대륙은?", a:["아시아", "유럽", "오세아니아"], c:0, e:"아시아는 세계에서 가장 넓은 대륙입니다."},
  {q:"세계에서 가장 넓은 대양은?", a:["태평양", "인도양", "남극해"], c:0, e:"태평양은 세계에서 가장 넓은 대양입니다."},
  {q:"오스트레일리아에 대한 설명으로 알맞은 것은?", a:["오세아니아에 있으며 대륙이자 나라이다", "유럽의 작은 반도 국가이다", "남극 대륙에 있다"], c:0, e:"오스트레일리아는 오세아니아에 있는 나라로, 대륙 이름으로도 쓰입니다."},
  {q:"나라의 영토 특징을 살펴볼 때 볼 수 있는 내용은?", a:["위치, 크기, 모양, 이웃한 나라", "좋아하는 음식만", "학생 수만"], c:0, e:"영토 특징은 위치, 크기, 모양, 주변 나라와 바다 등을 함께 살펴봅니다."},
  {q:"대한민국과 일본의 공통점으로 알맞은 것은?", a:["아시아에 있다", "남극 대륙에 있다", "대서양 한가운데 있다"], c:0, e:"대한민국과 일본은 모두 아시아에 있습니다."},
  {q:"브라질이 있는 대륙은?", a:["남아메리카", "유럽", "아프리카"], c:0, e:"브라질은 남아메리카에 있는 큰 나라입니다."},
  {q:"프랑스가 있는 대륙은?", a:["유럽", "오세아니아", "남극 대륙"], c:0, e:"프랑스는 유럽에 있습니다."},
  {q:"케냐와 이집트가 있는 대륙은?", a:["아프리카", "북아메리카", "아시아"], c:0, e:"케냐와 이집트는 아프리카에 있습니다."},
  {q:"세계 여러 나라를 비교할 때 먼저 살펴보면 좋은 자료는?", a:["세계 지도와 디지털 지도", "동화책 표지만", "운동장 시간표"], c:0, e:"지도와 디지털 공간 자료를 활용하면 위치와 영토 특징을 비교할 수 있습니다."},
  {q:"적도에 대한 설명으로 알맞은 것은?", a:["지구를 북반구와 남반구로 나누는 기준선", "동쪽과 서쪽을 나누는 기준선", "나라의 경계선"], c:0, e:"적도는 위도 0도이며 북반구와 남반구를 나누는 기준입니다."},
  {q:"본초 자오선에 대한 설명으로 알맞은 것은?", a:["경도 0도의 기준선", "위도 90도의 선", "대륙 이름"], c:0, e:"본초 자오선은 경도 0도의 기준입니다."},
  {q:"남극 대륙에 대한 설명으로 알맞은 것은?", a:["대부분 얼음으로 덮여 있다", "세계에서 가장 더운 사막만 있다", "여러 나라의 수도가 모여 있다"], c:0, e:"남극 대륙은 대부분 얼음으로 덮여 있고, 연구 활동이 이루어집니다."}
];

const chanceCards = [
  {title:"위성 영상 확인", text:"디지털 지도를 확대해 정확한 위치를 찾았습니다. 2마일리지를 얻습니다.", score:2},
  {title:"경도 헷갈림", text:"동경과 서경을 바꾸어 적었습니다. 다음 차례에 주사위가 1 줄어듭니다.", penalty:"slow"},
  {title:"대양 항해", text:"태평양을 건너 넓은 바다를 체험했습니다. 앞으로 3칸 이동합니다.", move:3},
  {title:"세계 지도 완성", text:"대륙과 대양 이름을 잘 정리했습니다. 3마일리지를 얻습니다.", score:3},
  {title:"길 잃은 여행자", text:"위도와 경도 표시를 다시 확인합니다. 뒤로 2칸 이동합니다.", move:-2},
  {title:"친구 설명", text:"나라의 위치와 영토 특징을 친구에게 설명했습니다. 나라 도장 1개가 있으면 2마일리지를 얻습니다.", stampScore:2},
  {title:"탐험 보고서", text:"지도, 지구본, 디지털 영상 자료의 장점을 비교했습니다. 2마일리지를 얻습니다.", score:2},
  {title:"출발점 비행", text:"공항으로 이동합니다. 출발점으로 이동하고 1마일리지를 얻습니다.", goStart:true}
];

let state = freshState("1");
const rooms = new Map([["1", state]]);
const timers = new Map();

function normalizeRoom(value) {
  const room = String(value || "1").trim().replace(/[^\w가-힣-]/g, "").slice(0, 12);
  return room || "1";
}

function getRoom(value) {
  const code = normalizeRoom(value);
  if (!rooms.has(code) && rooms.size >= 6) throw new Error("방은 최대 6개까지 만들 수 있습니다.");
  if (!rooms.has(code)) rooms.set(code, freshState(code));
  return rooms.get(code);
}

function freshState(roomCode) {
  return {
    roomCode,
    phase: "lobby",
    players: [],
    current: 0,
    secondsLeft: 20 * 60,
    dice: 1,
    rolled: false,
    properties: {},
    buyRights: {},
    pendingCard: null,
    lastResult: null,
    logs: [`${roomCode}번 방입니다. 모둠원은 같은 방 코드로 참가하세요.`],
    finishedReason: ""
  };
}

function publicState() {
  return {
    ...state,
    boardSpaces,
    ranking: [...state.players].sort((a, b) => scoreOf(b) - scoreOf(a)),
    rooms: Array.from(rooms.values()).map(room => ({
      roomCode: room.roomCode,
      phase: room.phase,
      players: room.players.length
    })),
    serverTime: Date.now()
  };
}

function scoreOf(p) {
  return p.score + p.stamps.length * 3 + new Set(p.continents).size * 2;
}

function isBuyable(space) {
  return ["country", "continent", "ocean"].includes(space.type);
}

function propertyCost(space) {
  if (space.type === "country") return 4;
  if (space.type === "continent") return 5;
  if (space.type === "ocean") return 6;
  return 0;
}

function propertyRent(space) {
  if (space.type === "country") return 2;
  if (space.type === "continent") return 3;
  if (space.type === "ocean") return 4;
  return 0;
}

function log(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 80);
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function playerById(id) {
  return state.players.find(p => p.id === id);
}

function currentPlayer() {
  return state.players[state.current];
}

function startTimer() {
  clearInterval(timers.get(state.roomCode));
  const room = state;
  const timer = setInterval(() => {
    state = room;
    if (state.phase !== "playing") return;
    state.secondsLeft -= 1;
    if (state.secondsLeft <= 0) finish("20분이 지났습니다.");
  }, 1000);
  timers.set(room.roomCode, timer);
}

function finish(reason) {
  state.phase = "finished";
  state.finishedReason = reason;
  state.pendingCard = null;
  clearInterval(timers.get(state.roomCode));
  timers.delete(state.roomCode);
  log(reason);
}

function movePlayer(p, steps) {
  const old = p.pos;
  const next = (p.pos + steps + boardSpaces.length) % boardSpaces.length;
  if (steps > 0 && old + steps >= boardSpaces.length) {
    p.score += 3;
    log(`${p.name}이 출발을 지나 3마일리지를 얻었습니다.`);
  }
  p.pos = next;
}

function createQuiz(space, playerId) {
  const card = cards[Math.floor(Math.random() * cards.length)];
  state.pendingCard = {
    id: randomId(),
    type: "quiz",
    playerId,
    space,
    question: card.q,
    choices: card.a,
    correct: card.c,
    explain: card.e,
    answered: false,
    chosen: null
  };
}

function applyChance(playerId) {
  const p = playerById(playerId);
  const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
  state.pendingCard = {
    id: randomId(),
    type: "chance",
    playerId,
    title: card.title,
    text: card.text,
    answered: true
  };
  if (card.score) p.score += card.score;
  if (card.penalty === "slow") p.slow = true;
  if (card.stampScore && p.stamps.length) p.score += card.stampScore;
  if (card.move) movePlayer(p, card.move);
  if (card.goStart) {
    p.pos = 0;
    p.score += 1;
  }
  log(`${p.name}: ${card.title}`);
}

function endTurn(playerId) {
  const p = currentPlayer();
  if (!p || p.id !== playerId || state.pendingCard && !state.pendingCard.answered) return false;
  delete state.buyRights[p.id];
  state.current = (state.current + 1) % state.players.length;
  state.rolled = false;
  state.pendingCard = null;
  state.lastResult = null;
  return true;
}

function handleAction(body) {
  const {action, playerId, name, choice} = body || {};
  if (action === "join") {
    let p = playerById(playerId);
    if (p) {
      p.name = cleanName(name || p.name);
      return {playerId: p.id};
    }
    if (state.phase !== "lobby") throw new Error("게임이 이미 시작되어 새로 참가할 수 없습니다.");
    if (state.players.length >= 6) throw new Error("최대 6명까지 참가할 수 있습니다.");
    const id = randomId();
    p = {id, name: cleanName(name || `${state.players.length + 1}번`), color: colors[state.players.length], pos: 0, score: 20, stamps: [], continents: [], slow: false};
    state.players.push(p);
    log(`${p.name}이 참가했습니다.`);
    return {playerId: id};
  }

  if (action === "reset") {
    clearInterval(timers.get(state.roomCode));
    timers.delete(state.roomCode);
    Object.assign(state, freshState(state.roomCode));
    return {};
  }

  if (action === "start") {
    if (state.phase !== "lobby") return {};
    if (state.players.length < 2) throw new Error("2명 이상 참가해야 시작할 수 있습니다.");
    state.phase = "playing";
    state.secondsLeft = 20 * 60;
    state.current = 0;
    state.rolled = false;
    log("게임을 시작했습니다.");
    startTimer();
    return {};
  }

  if (action === "finish") {
    finish("게임을 마쳤습니다.");
    return {};
  }

  if (state.phase !== "playing") throw new Error("지금은 게임 중이 아닙니다.");
  const p = currentPlayer();
  if (!p || p.id !== playerId) throw new Error("현재 차례인 학생만 조작할 수 있습니다.");

  if (action === "roll") {
    if (state.rolled || state.pendingCard) throw new Error("이미 주사위를 굴렸습니다.");
    delete state.buyRights[p.id];
    let value = Math.floor(Math.random() * 6) + 1;
    if (p.slow) {
      value = Math.max(1, value - 1);
      p.slow = false;
    }
    state.dice = value;
    state.rolled = true;
    movePlayer(p, value);
    const space = {...boardSpaces[p.pos], index: p.pos};
    log(`${p.name}이 ${value}칸 이동해 ${space.name}에 도착했습니다.`);
    const ownerId = state.properties[p.pos];
    if (isBuyable(space) && ownerId && ownerId !== p.id) {
      const owner = playerById(ownerId);
      const rent = propertyRent(space);
      p.score = Math.max(0, p.score - rent);
      if (owner) owner.score += rent;
      log(`${p.name}이 ${space.name} 통행료 ${rent}마일리지를 ${owner ? owner.name : "소유자"}에게 냈습니다.`);
    }
    if (["quiz", "country", "continent", "ocean"].includes(space.type)) createQuiz(space, p.id);
    if (space.type === "chance") applyChance(p.id);
    return {};
  }

  if (action === "buy") {
    if (!state.rolled || state.pendingCard && !state.pendingCard.answered) throw new Error("카드를 먼저 해결해야 살 수 있습니다.");
    const space = {...boardSpaces[p.pos], index: p.pos};
    if (!isBuyable(space)) throw new Error("이 칸은 살 수 없습니다.");
    if (state.buyRights[p.id] !== p.pos) throw new Error("문제를 맞힌 칸만 살 수 있습니다.");
    if (state.properties[p.pos]) throw new Error("이미 누군가 산 칸입니다.");
    const cost = propertyCost(space);
    if (p.score < cost) throw new Error(`${cost}마일리지가 필요합니다.`);
    p.score -= cost;
    state.properties[p.pos] = p.id;
    delete state.buyRights[p.id];
    log(`${p.name}이 ${space.name}을 ${cost}마일리지에 샀습니다.`);
    return {};
  }

  if (action === "sell") {
    const space = {...boardSpaces[p.pos], index: p.pos};
    if (!isBuyable(space) || state.properties[p.pos] !== p.id) throw new Error("현재 칸은 팔 수 없습니다.");
    const refund = Math.ceil(propertyCost(space) * 0.7);
    delete state.properties[p.pos];
    p.score += refund;
    log(`${p.name}이 ${space.name}을 팔아 ${refund}마일리지를 받았습니다.`);
    return {};
  }

  if (action === "answer") {
    const card = state.pendingCard;
    if (!card || card.type !== "quiz" || card.playerId !== p.id || card.answered) throw new Error("풀 수 있는 카드가 없습니다.");
    card.answered = true;
    card.chosen = Number(choice);
    const space = card.space;
    if (card.chosen === card.correct) {
      p.score += 2;
      if (isBuyable(space) && !state.properties[space.index]) {
        state.buyRights[p.id] = space.index;
      }
      if (space.type === "country" && !p.stamps.includes(space.name)) {
        p.stamps.push(space.name);
        p.continents.push(space.continent);
        p.score += 1;
        log(`${p.name}이 ${space.name} 도장을 받았습니다.`);
      }
      if ((space.type === "continent" || space.type === "ocean") && !p.stamps.includes(space.name)) p.stamps.push(space.name);
      state.lastResult = `${p.name} 정답! 2마일리지를 얻었습니다.`;
      log(state.lastResult);
    } else {
      delete state.buyRights[p.id];
      p.score = Math.max(0, p.score - 1);
      state.lastResult = `${p.name} 아쉽습니다. 1마일리지를 사용했습니다.`;
      log(state.lastResult);
    }
    return {};
  }

  if (action === "next") {
    endTurn(playerId);
    return {};
  }

  throw new Error("알 수 없는 요청입니다.");
}

function cleanName(value) {
  return String(value || "").trim().slice(0, 8) || "학생";
}

function sendJson(res, code, data) {
  res.writeHead(code, {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store"});
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 10000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
  });
}

function mime(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/state") {
      state = getRoom(url.searchParams.get("room"));
      return sendJson(res, 200, publicState());
    }
    if (req.method === "POST" && url.pathname === "/api/action") {
      const body = await readBody(req);
      state = getRoom(body.room);
      const result = handleAction(body);
      return sendJson(res, 200, {ok:true, ...result, state: publicState()});
    }
    let file = url.pathname === "/" ? "world_blue_marble_lan.html" : decodeURIComponent(url.pathname.slice(1));
    file = path.normalize(file).replace(/^(\.\.[/\\])+/, "");
    const fullPath = path.join(ROOT, file);
    if (!fullPath.startsWith(ROOT) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
      return res.end("파일을 찾을 수 없습니다.");
    }
    res.writeHead(200, {"Content-Type": mime(fullPath), "Cache-Control":"no-store"});
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    sendJson(res, 400, {ok:false, error: err.message || "요청을 처리하지 못했습니다."});
  }
});

function localAddresses() {
  const found = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === "IPv4" && !item.internal) found.push(item.address);
    }
  }
  return found;
}

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("World Blue Marble server started.");
  console.log("Local/LAN use: open one of the addresses below.");
  console.log("Online hosting use: open the public HTTPS address from your host.");
  console.log("");
  for (const ip of localAddresses()) console.log(`LAN address: http://${ip}:${PORT}`);
  console.log(`This PC: http://127.0.0.1:${PORT}`);
  console.log("");
  console.log("Press Ctrl+C to stop.");
});
