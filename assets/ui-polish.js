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

  function applyPolish() {
    buildSupportTabs();
    compactActionButtons();
  }

  ready(() => {
    applyPolish();
    const observer = new MutationObserver(() => applyPolish());
    observer.observe(document.body, {childList:true, subtree:true});
  });
})();
