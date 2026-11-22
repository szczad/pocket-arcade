import logoUrl from '../assets/logo/pocket-arcade-green.svg';

export const arcadeShell = `
<div class="shell">
  <header class="topbar">
    <a class="brand" href="#"><img class="brand-logo" src="${logoUrl}" alt=""></a>
    <div class="header-actions"><button class="text-button" id="login"></button><button class="icon-button settings-open">⚙</button></div>
  </header>
  <main>
    <section id="picker">
      <div class="hero">
        <div><p class="eyebrow"><span class="status-dot"></span> YOUR LITTLE CORNER OF PLAY</p>
          <h1>Pocket Arcade<span class="period">.</span></h1><p class="intro"></p></div>
        <div class="hero-stamp" aria-hidden="true"><span></span><strong></strong><span></span></div>
      </div>
      <div class="section-heading"><div><p class="eyebrow">THE COLLECTION <span class="subtle"></span></p><h2></h2></div><span class="section-note"></span></div>
      <div class="cards"></div>
      <div class="bottom-line"><span></span><span></span></div>
    </section>
    <section id="game-view" hidden>
      <div class="game-heading"><a class="back" href="#"></a><button class="icon-button settings-open">⚙</button></div>
      <div class="game-layout">
        <div class="game-main">
          <div class="game-title-row">
            <div><p class="eyebrow">NOW PLAYING <span class="subtle">/ <span id="game-number"></span></span></p><h2 id="game-title"></h2></div>
            <div class="score-box"><span class="micro"></span><strong id="score">0</strong></div>
          </div>
          <div class="board-wrap"><canvas></canvas>
            <div id="board-message" class="board-message"><span id="message-label"></span><strong id="message-title"></strong><button id="start" class="primary">START GAME <span>→</span></button></div>
          </div>
          <div class="game-actions"><button id="pause" class="secondary" disabled></button><button id="replay" class="secondary"></button><button id="expand" class="secondary" aria-pressed="false"></button></div>
        </div>
        <aside class="game-side">
          <section class="achievement-pane" hidden></section>
          <p class="eyebrow"></p><p id="instructions"></p><p class="hint"></p>
          <button id="flag" class="secondary" aria-pressed="false" hidden></button>
          <div class="dpad"><button data-action="up">▲</button><button data-action="left">◀</button><button data-action="down">▼</button><button data-action="right">▶</button></div>
          <button id="fire" class="primary artillery-fire" hidden></button>
          <p class="side-foot"></p>
        </aside>
      </div>
    </section>
    <section class="account-section" hidden><div id="account"></div></section>
  </main>
  <footer><span>POCKET ARCADE <span class="period">✳</span></span><span></span></footer>
</div>
<dialog id="settings">
  <form method="dialog">
    <div class="dialog-head"><div><p class="eyebrow"></p><h2></h2></div><button class="icon-button" value="close">×</button></div>
    <label class="setting-row"><span><strong></strong><small></small></span><input id="music" type="checkbox" checked></label>
    <label class="setting-row"><span><strong></strong><small></small></span><input id="effects" type="checkbox" checked></label>
    <label class="setting-row"><span><strong></strong><small></small></span><select id="theme"><option value="midnight"></option><option value="amber"></option><option value="mint"></option></select></label>
    <label class="setting-row"><span><strong></strong><small></small></span><select id="language"><option value="en">English</option><option value="pl">Polski</option></select></label>
    <div id="game-options"></div>
    <p id="storage-note" class="hint"></p>
    <button class="primary dialog-close" value="close">DONE <span>→</span></button>
  </form>
</dialog>`;
