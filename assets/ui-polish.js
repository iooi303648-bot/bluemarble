(() => {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, {once:true});
    else fn();
  }

  function moveInto(parent, child) {
    if (parent && child && child.parentElement !== parent) parent.appendChild(child);
  }

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function roomUrl(room) {
    return `${location.origin}${location.pathname}?room=${encodeURIComponent(room || "1")}`;
  }

  function getRoomSummary() {
    const roomInfo = clean(document.getElementById("roomInfo")?.textContent);
    const roomInput = clean(document.getElementById("roomCode")?.value);
    const room = roomInfo.match(/방\s*([^·\s]+)/)?.[1] || roomInput || "1";
    const countText = roomInfo.match(/참가\s*(\d+)\/6명/)?.[1];
    const playerCount = Number(countText || document.querySelectorAll("#players .player").length || 0);
    const name = roomInfo.match(/내 이름:\s*([^·]+)/)?.[1]?.trim() || clean(document.getElementById("playerName")?.value) || "";
    const waiting = roomInfo.includes("참가 대기") || clean(document.getElementById("activePlayer")?.textContent).includes("대기");
    return {room, playerCount, count: `${playerCount}/6명`, name, waiting};
  }

  function buildSupportTabs() {
    const side = document.querySelector(".side-panel");
    if (!side || side.querySelector(".support-tabs-shell")) return;

    const bank = document.getElementById("bankPanel");
    const owned = document.getElementById("myProperties")?.closest(".owned-panel");
    const log = document.querySelector(".log-panel");
    if (!bank || !owned || !log) return;

    const shell = document.createElement("section");
    shell.className = "support-tabs-shell";
    shell.innerHTML = `
      <div class="support-tab-buttons" role="tablist" aria-label="보조 정보">
        <button type="button" class="support-tab active" data-tab="log">최근 기록</button>
        <button type="button" class="support-tab" data-tab="owned">소유 땅</button>
        <button type="button" class="support-tab" data-tab="bank">은행</button>
      </div>
      <div class="support-tab-body">
        <div class="support-pane active" data-pane="log"></div>
        <div class="support-pane" data-pane="owned"></div>
        <div class="support-pane" data-pane="bank"></div>
      </div>`;

    side.appendChild(shell);
    moveInto(shell.querySelector('[data-pane="log"]'), log);
    moveInto(shell.querySelector('[data-pane="owned"]'), owned);
    moveInto(shell.querySelector('[data-pane="bank"]'), bank);

    shell.querySelectorAll(".support-tab").forEach(button => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        shell.querySelectorAll(".support-tab").forEach(el => el.classList.toggle("active", el === button));
        shell.querySelectorAll(".support-pane").forEach(el => el.classList.toggle("active", el.dataset.pane === tab));
      });
    });
  }

  function compactActionButtons() {
    const actions = document.querySelector(".turn-box .actions");
    if (!actions || actions.classList.contains("compact-actions")) return;
    actions.classList.add("compact-actions");
  }

  function ensureTopStats() {
    const header = document.querySelector("header");
    if (!header || header.querySelector(".top-stats")) return;
    const stats = document.createElement("div");
    stats.className = "top-stats";
    const timer = header.querySelector(".timer");
    header.insertBefore(stats, timer || null);
  }

  function compactLobbyInfo() {
    const roomInfo = document.getElementById("roomInfo");
    if (!roomInfo) return;
    const summary = getRoomSummary();
    const status = summary.waiting ? "참가 대기" : "여행 중";
    const name = summary.name ? ` · 내 이름: ${summary.name}` : "";
    const compact = `방 ${summary.room} · ${status} · 참가 ${summary.count}${name}`;
    if (clean(roomInfo.textContent) !== compact) {
      roomInfo.dataset.compactText = compact;
      roomInfo.textContent = compact;
    }
  }

  function updateTopStats() {
    const stats = document.querySelector(".top-stats");
    if (!stats) return;
    const summary = getRoomSummary();
    const turn = clean(document.getElementById("activePlayer")?.textContent).replace("참가 대기 중", "대기 중") || "대기 중";
    const era = clean(document.getElementById("gameStatus")?.textContent).match(/(전반전|후반전)/)?.[1] || "여행 중";
    const html = `
      <span class="top-pill">방 ${summary.room}</span>
      <span class="top-pill">${summary.count}</span>
      <span class="top-pill">${era}</span>
      <span class="top-pill">${turn}</span>`;
    if (stats.dataset.lastHtml !== html) {
      stats.dataset.lastHtml = html;
      stats.innerHTML = html;
    }
  }

  function ensureCenterLive() {
    const center = document.querySelector(".space.center");
    if (!center) return null;
    center.classList.add("live-center-card");
    [".center-globe", ".center-title", ".center-grid"].forEach(selector => {
      const el = center.querySelector(selector);
      if (el) el.classList.add("legacy-center-content");
    });
    let live = center.querySelector(".center-live");
    if (!live) {
      live = document.createElement("div");
      live.className = "center-live";
      center.appendChild(live);
    }
    return live;
  }

  function currentPlaceText() {
    const cell = document.querySelector(".space.current");
    const name = clean(cell?.querySelector(".name")?.textContent) || "세계 여행";
    const meta = clean(cell?.querySelector(".meta, .meta-slot")?.textContent);
    return {name, meta};
  }

  function updateCenterLive() {
    const live = ensureCenterLive();
    if (!live) return;
    const mission = clean(document.getElementById("missionText")?.textContent);
    const cardText = clean(document.getElementById("travelCard")?.textContent);
    const dice = clean(document.getElementById("dice")?.textContent) || "⚀ ⚀";
    const place = currentPlaceText();
    const hasCard = cardText && !cardText.includes("주사위를 굴리면");
    const title = hasCard ? "카드 알림" : place.name;
    const body = hasCard ? cardText.replace(/^여권 카드\s*/, "") : (mission || "현재 여행 상황을 확인하세요.");
    const html = `
      <div class="live-eyebrow">${hasCard ? "방금 도착한 카드" : "현재 도착지"}</div>
      <h2 class="live-title">${hasCard ? "🛂 " : "🧭 "}${title}</h2>
      <p class="live-text">${body}</p>
      <div class="live-stats">
        <div class="live-stat"><span>주사위</span>${dice}</div>
        <div class="live-stat"><span>칸 정보</span>${place.meta || "이동 대기"}</div>
        <div class="live-stat"><span>다음 행동</span>${mission || "차례 확인"}</div>
      </div>`;
    if (live.dataset.lastHtml !== html) {
      live.dataset.lastHtml = html;
      live.innerHTML = html;
    }
  }

  function ensureLobbyScreen() {
    const app = document.querySelector(".app");
    if (!app) return null;
    let lobby = document.querySelector(".travel-lobby-screen");
    if (lobby) return lobby;

    lobby = document.createElement("section");
    lobby.className = "travel-lobby-screen";
    lobby.innerHTML = `
      <div class="lobby-card">
        <div class="lobby-card-head">
          <span class="lobby-badge">✈ 출국 대기실</span>
          <span>여행 준비 중</span>
        </div>
        <div class="lobby-section lobby-grid">
          <div>
            <span class="lobby-label">방 코드</span>
            <div class="room-code-card" data-lobby-room-code>1</div>
          </div>
          <div>
            <span class="lobby-label">방 URL <small>(같은 와이파이에서 접속)</small></span>
            <div class="room-url-wrap">
              <span class="room-url" data-lobby-url></span>
              <button type="button" class="copy-url-btn" data-lobby-copy>복사</button>
            </div>
          </div>
          <div class="ticket-art" aria-hidden="true">🛫</div>
        </div>
        <div class="lobby-section">
          <p class="join-help">👥 이름을 입력하고 참가하세요</p>
          <div class="join-row">
            <input class="lobby-name-input" data-lobby-name maxlength="8" placeholder="예: 지우, 민준, 하늘이">
            <button type="button" class="lobby-primary-btn" data-lobby-join>✈ 참가하기</button>
            <button type="button" class="lobby-reset-btn" data-lobby-leave>↻ 내 기기 초기화</button>
          </div>
        </div>
        <div class="lobby-section">
          <div class="passenger-head">
            <h2 class="passenger-title">탑승자 <span class="passenger-count" data-lobby-count>0/6명</span></h2>
            <span class="passenger-status">2명 이상이면 출발 가능</span>
          </div>
          <div class="passenger-grid" data-lobby-passengers></div>
        </div>
        <div class="lobby-bottom">
          <div class="start-card">
            <button type="button" class="lobby-start-btn" data-lobby-start>✈ 여행 시작</button>
            <p class="start-note">2명 이상 모이면 누구나 시작할 수 있어요</p>
            <button type="button" class="lobby-secondary-btn" data-lobby-new-room>새 방 만들기</button>
          </div>
          <div class="how-card">
            <p class="how-title">이렇게 여행을 시작해요!</p>
            <div class="how-steps">
              <div class="how-step"><span class="step-num">1</span><div><b>방 코드 확인</b><span>친구들이 같은 방으로 들어와요.</span></div></div>
              <div class="how-step"><span class="step-num">2</span><div><b>이름 입력 후 참가</b><span>자기 이름으로 탑승권을 받아요.</span></div></div>
              <div class="how-step"><span class="step-num">3</span><div><b>아무나 여행 시작</b><span>2명 이상이면 바로 출발해요.</span></div></div>
            </div>
          </div>
        </div>
      </div>
      <p class="lobby-footer-note">★ 2명 이상 모이면 언제든 시작 가능!</p>`;

    const header = app.querySelector("header");
    app.insertBefore(lobby, header?.nextSibling || app.firstChild);
    bindLobbyScreen(lobby);
    return lobby;
  }

  function bindLobbyScreen(lobby) {
    if (lobby.dataset.bound === "1") return;
    lobby.dataset.bound = "1";
    const roomInput = document.getElementById("roomCode");
    const nameInput = document.getElementById("playerName");
    const lobbyName = lobby.querySelector("[data-lobby-name]");
    if (nameInput) nameInput.placeholder = "예: 지우, 민준, 하늘이";
    lobbyName.addEventListener("input", () => {
      if (nameInput) nameInput.value = lobbyName.value;
    });
    lobby.querySelector("[data-lobby-join]").addEventListener("click", () => {
      if (nameInput) nameInput.value = lobbyName.value;
      document.getElementById("joinButton")?.click();
    });
    lobby.querySelector("[data-lobby-leave]").addEventListener("click", () => document.getElementById("leaveButton")?.click());
    lobby.querySelector("[data-lobby-start]").addEventListener("click", () => document.getElementById("startGame")?.click());
    lobby.querySelector("[data-lobby-new-room]").addEventListener("click", () => document.getElementById("resetGame")?.click());
    lobby.querySelector("[data-lobby-copy]").addEventListener("click", async () => {
      const summary = getRoomSummary();
      const url = roomUrl(summary.room);
      try {
        await navigator.clipboard.writeText(url);
        lobby.querySelector("[data-lobby-copy]").textContent = "복사됨";
        setTimeout(() => lobby.querySelector("[data-lobby-copy]").textContent = "복사", 1200);
      } catch {
        prompt("방 URL을 복사하세요", url);
      }
    });
    if (roomInput) {
      roomInput.addEventListener("input", () => updateLobbyScreen());
    }
  }

  function passengerData() {
    const rows = Array.from(document.querySelectorAll("#players .player"));
    return rows.slice(0, 6).map(row => {
      const name = clean(row.querySelector("b")?.textContent).replace(/ · 나$/, "") || "친구";
      const token = row.querySelector(".token");
      const piece = clean(token?.textContent) || [...name][0] || "?";
      const color = token?.style.getPropertyValue("--piece") || "#1f8fa0";
      const mine = row.classList.contains("mine");
      return {name, piece, color, mine};
    });
  }

  function updateLobbyScreen() {
    const lobby = ensureLobbyScreen();
    if (!lobby) return;
    const summary = getRoomSummary();
    const url = roomUrl(summary.room);
    const realName = document.getElementById("playerName")?.value || "";
    const lobbyName = lobby.querySelector("[data-lobby-name]");
    if (document.activeElement !== lobbyName && lobbyName.value !== realName) lobbyName.value = realName;
    lobby.querySelector("[data-lobby-room-code]").textContent = summary.room;
    lobby.querySelector("[data-lobby-url]").textContent = url;
    lobby.querySelector("[data-lobby-count]").textContent = summary.count;
    const startBtn = lobby.querySelector("[data-lobby-start]");
    const realStart = document.getElementById("startGame");
    startBtn.disabled = !!realStart?.disabled;
    startBtn.textContent = summary.playerCount >= 2 ? "✈ 여행 시작" : "✈ 여행 대기";
    lobby.querySelector("[data-lobby-join]").disabled = !!document.getElementById("joinButton")?.disabled;

    const passengers = passengerData();
    const grid = lobby.querySelector("[data-lobby-passengers]");
    const html = Array.from({length: 6}, (_, i) => {
      const p = passengers[i];
      if (!p) {
        return `<div class="passenger-card empty"><span class="passenger-token">?</span><span class="passenger-name">빈 자리</span><span class="passenger-status">탑승 대기</span></div>`;
      }
      return `<div class="passenger-card${p.mine ? " mine" : ""}"><span class="passenger-token" style="--piece:${p.color}">${p.piece}</span><span class="passenger-name">${p.name}</span><span class="passenger-status">준비 완료</span></div>`;
    }).join("");
    if (grid.dataset.lastHtml !== html) {
      grid.dataset.lastHtml = html;
      grid.innerHTML = html;
    }
  }

  function applyStructure() {
    ensureTopStats();
    ensureLobbyScreen();
    buildSupportTabs();
    compactActionButtons();
  }

  function applyDynamicText() {
    compactLobbyInfo();
    updateTopStats();
    updateCenterLive();
    updateLobbyScreen();
  }

  ready(() => {
    applyStructure();
    applyDynamicText();
    setInterval(() => {
      applyStructure();
      applyDynamicText();
    }, 700);
  });
})();
