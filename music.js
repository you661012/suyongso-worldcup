// 배경음악: 유튜브 공식 플레이어로 "으라차차"를 반복 재생하고, 화면 구석에 켜기/끄기 버튼을 붙인다.
// 브라우저가 자동 재생을 막기 때문에, 음악이 켜진 상태라도 화면을 처음 누르는 순간부터 소리가 나온다.
(() => {
  const VIDEO = "BHpdi4kn_dE";
  const store = {
    get(k) { try { return localStorage.getItem("suyongso:" + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("suyongso:" + k, v); } catch {} },
  };
  let wantOn = store.get("music") !== "off";
  let player, ready = false, playing = false;

  const css = document.createElement("style");
  css.textContent = `
#bgm { position: fixed; right: max(14px, env(safe-area-inset-right, 0px)); bottom: max(14px, env(safe-area-inset-bottom, 0px)); z-index: 25;
  display: flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 999px; cursor: pointer;
  font: 400 0.95rem "Black Han Sans", sans-serif; color: #0e0c1d; background: #ffc83d; border: 3px solid #0e0c1d; box-shadow: 0 4px 0 #0e0c1d; }
#bgm:active { transform: translateY(3px); box-shadow: 0 1px 0 #0e0c1d; }
#bgm.off { background: #3a3560; color: #f6f1ff; }
#bgm .eq { display: flex; align-items: flex-end; gap: 2px; width: 16px; height: 14px; }
#bgm .eq i { flex: 1; background: currentColor; height: 30%; }
#bgm.on .eq i { animation: eq 0.5s ease-in-out infinite alternate; }
#bgm.on .eq i:nth-child(2) { animation-delay: 0.15s; } #bgm.on .eq i:nth-child(3) { animation-delay: 0.3s; }
@keyframes eq { to { height: 100%; } }
#bgm-player { position: fixed; left: -9999px; top: 0; width: 200px; height: 113px; }
@media (max-width: 700px) { #bgm:not(.wait) { padding: 10px; } #bgm:not(.wait) .lbl { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); } }
@media (prefers-reduced-motion: reduce) { #bgm.on .eq i { animation: none; height: 70%; } }`;
  document.head.append(css);

  const btn = document.createElement("button");
  btn.id = "bgm"; btn.type = "button";
  btn.innerHTML = `<span class="eq"><i></i><i></i><i></i></span><span class="lbl"></span>`;
  const holder = document.createElement("div"); holder.id = "bgm-player";
  const slot = document.createElement("div"); holder.append(slot);
  document.body.append(btn, holder);

  function paint() {
    btn.className = playing ? "on" : wantOn ? "wait" : "off";
    btn.querySelector(".lbl").textContent = playing ? "으라차차 ON" : wantOn ? "눌러서 으라차차" : "음악 OFF";
    btn.setAttribute("aria-pressed", String(playing));
  }
  paint();

  function play() {
    if (!ready) return;
    player.unMute(); player.setVolume(60); player.playVideo();
  }

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player(slot, {
      width: 200, height: 113, videoId: VIDEO,
      playerVars: { start: Math.floor(Number(store.get("musicT")) || 0), loop: 1, playlist: VIDEO, controls: 0, playsinline: 1 },
      events: {
        onReady() { ready = true; if (wantOn) play(); },
        onStateChange(e) {
          playing = e.data === YT.PlayerState.PLAYING;
          if (e.data === YT.PlayerState.ENDED) player.seekTo(0);
          paint();
        },
      },
    });
  };
  const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.append(s);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (playing) { wantOn = false; player.pauseVideo(); }
    else { wantOn = true; play(); }
    store.set("music", wantOn ? "on" : "off"); paint();
    btn.blur(); // 러너에서 스페이스바로 점프할 때 버튼이 다시 눌리지 않게
  });

  // 자동 재생이 막혔을 때: 화면 어디든 처음 누르면 시작
  const kick = () => { if (wantOn && !playing) play(); };
  addEventListener("pointerdown", kick, true);
  addEventListener("keydown", kick, true);

  // 다른 게임으로 넘어가도 노래가 처음부터 다시 시작하지 않게 재생 위치를 기억
  addEventListener("pagehide", () => { if (ready) store.set("musicT", String(player.getCurrentTime() || 0)); });
})();
