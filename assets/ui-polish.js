(() => {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, {once:true});
    else fn();
  }

  function moveInto(parent, child) {
    if (parent && child && child.parentElement !== parent) parent.appendChild(child);
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

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function updateTopStats() {
    const stats = document.querySelector(".top-stats");
    if (!stats) return;
    const roomInfo = clean(document.getElementById("roomInfo")?.textContent);
    const room = roomInfo.match(/방\s*([^·\s]+)/)?.[1] || "-";
    const count = roomInfo.match(/참가\s*(\d+\/6명)/)?.[1] || "0/6명";
    const turn = clean(document.getElementById("activePlayer")?.textContent).replace("참가 대기 중", "대기 중") || "대기 중";
    const era = clean(document.getElementById("gameStatus")?.textContent).match(/(전반전|후반전)/)?.[1] || "여행 중";
    const html = `
      <span class="top-pill">방 ${room}</span>
      <span class="top-pill">${count}</span>
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

  function applyStructure() {
    ensureTopStats();
    buildSupportTabs();
    compactActionButtons();
  }

  function applyDynamicText() {
    updateTopStats();
    updateCenterLive();
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
