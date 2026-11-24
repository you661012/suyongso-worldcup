// 수용소 게임센터 공통 코드: 사진 목록, 얼굴 자르기, 파티클 효과, 결과 복사.

// face: 사진 안에서 얼굴이 있는 영역 (가로 중심 cx, 위 top, 아래 bot, 모두 0~1 비율)
const PHOTOS = [
  { src: "img/p01.jpg", w: 675, h: 900, t: "고깃집 저격수", d: "삼겹살 다음 타겟은 너야", face: { cx: 0.53, top: 0.22, bot: 0.53 } },
  { src: "img/p02.jpg", w: 900, h: 872, t: "노래방 2차의 증거", d: "뒤에서 춤추는 사람 정체 아직 미상", face: { cx: 0.52, top: 0.33, bot: 1.0 } },
  { src: "img/p03.jpg", w: 675, h: 900, t: "웃음 측정 불가", d: "카메라 셔터가 웃음 속도를 못 따라감", face: { cx: 0.54, top: 0.36, bot: 0.95 } },
  { src: "img/p04.jpg", w: 675, h: 900, t: "말 벽지 앞의 남자", d: "보라 조명, 그리고 뒤에서 지켜보는 말들", face: { cx: 0.51, top: 0.30, bot: 0.90 } },
  { src: "img/p05.jpg", w: 675, h: 900, t: "건배 직전 붕괴", d: "소주잔은 지켰지만 표정은 못 지킴", face: { cx: 0.49, top: 0.0, bot: 0.40 } },
  { src: "img/p06.jpg", w: 900, h: 507, t: "초근접 콧구멍 캠", d: "뒤에 누워 있는 사람 발까지 출연", face: { cx: 0.53, top: -0.1, bot: 1.0 } },
  { src: "img/p07.jpg", w: 506, h: 900, t: "흔들린 영혼", d: "사진인가 인상파 회화인가", face: { cx: 0.48, top: 0.0, bot: 0.76 } },
  { src: "img/p08.jpg", w: 675, h: 900, t: "수증기 속 실루엣", d: "다음 학기 증명사진으로 제출 예정", face: { cx: 0.54, top: 0.31, bot: 0.66 } },
  { src: "img/p09.jpg", w: 506, h: 900, t: "1교시 직전의 얼굴", d: "한쪽 눈은 이미 퇴근함", face: { cx: 0.41, top: 0.03, bot: 0.83 } },
  { src: "img/p10.jpg", w: 675, h: 900, t: "편의점 카운터 후광", d: "진열대 조명이 만든 성스러운 셀카", face: { cx: 0.57, top: 0.02, bot: 0.88 } },
  { src: "img/p11.jpg", w: 507, h: 900, t: "샤우팅 대폭발", d: "이 사진에서 소리가 들린다면 정상", face: { cx: 0.70, top: 0.43, bot: 0.75 } },
  { src: "img/p12.jpg", w: 675, h: 900, t: "안주 영접", d: "파스타 나오자 눈빛이 바뀐 순간", face: { cx: 0.51, top: 0.0, bot: 0.31 } },
  { src: "img/p13.jpg", w: 675, h: 900, t: "북채 든 넘버원", d: "뭘 칠 건지는 본인도 모름", face: { cx: 0.51, top: 0.09, bot: 0.42 } },
  { src: "img/p14.jpg", w: 675, h: 900, t: "눈이 사라지는 웃음", d: "웃는 순간 시야 0%", face: { cx: 0.64, top: 0.15, bot: 0.92 } },
  { src: "img/p15.jpg", w: 900, h: 675, t: "코골이 현장 검거", d: "빨간 펜으로 증거 표시 완료", face: { cx: 0.40, top: 0.02, bot: 0.95 } },
].map((p, i) => ({ ...p, id: i }));

const $ = (id) => document.getElementById(id);
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, REDUCE ? Math.min(ms, 150) : ms));
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickOne = (a) => a[(Math.random() * a.length) | 0];

// W×H 상자에 얼굴을 맞춰 넣는 background 스타일.
// strips > 1 이면 얼굴을 세로로 strips 칸으로 나눈 것 중 strip 번째 칸만 보여준다 (슬롯머신용).
function faceBg(el, p, W, H, { strip = 0, strips = 1, pad = 0.12 } = {}) {
  const fh = (p.face.bot - p.face.top) * p.h;
  const scale = (H * strips) / (fh * (1 + pad));
  const iw = p.w * scale, ih = p.h * scale;
  // 얼굴이 사진 가장자리에 붙어 있어도 상자 밖으로 빈 곳이 보이지 않게 위치를 사진 안쪽으로 제한
  const clamp = (v, size, box) => (size >= box ? Math.min(0, Math.max(box - size, v)) : (box - size) / 2);
  const x = clamp(W / 2 - p.face.cx * iw, iw, W);
  const y = clamp(-(p.face.top * p.h - (fh * pad) / 2) * scale, ih, H * strips);
  el.style.backgroundImage = `url("${p.src}")`;
  el.style.backgroundSize = `${iw}px ${ih}px`;
  el.style.backgroundPosition = `${x}px ${y - strip * H}px`;
  el.style.backgroundRepeat = "no-repeat";
}

// 캔버스에 얼굴을 동그랗게 그린다 (러너용)
function drawFace(ctx, img, p, x, y, r) {
  const fh = (p.face.bot - p.face.top) * p.h * 1.05;
  const sx = p.face.cx * p.w - fh / 2, sy = ((p.face.top + p.face.bot) / 2) * p.h - fh / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  ctx.fillStyle = "#1a1733"; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.drawImage(img, sx, sy, fh, fh, x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

function loadImages() {
  return Promise.all(PHOTOS.map((p) => new Promise((res) => {
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(im); im.src = p.src; p.img = im;
  })));
}

// ---------- 파티클 ----------
const FX = (() => {
  let cv, cx, parts = [], running = false, confettiUntil = 0;
  const COLORS = ["#ffc83d", "#ff3d5a", "#2f8bff", "#f6f1ff"];
  function ensure() {
    if (cv) return;
    cv = document.createElement("canvas"); cv.id = "fx"; document.body.append(cv);
    cx = cv.getContext("2d");
    const resize = () => { const r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; cx.setTransform(r, 0, 0, r, 0, 0); };
    addEventListener("resize", resize); resize();
  }
  function loop() {
    if (running) return; running = true;
    const tick = (now) => {
      if (now < confettiUntil) {
        for (let i = 0; i < 4; i++) parts.push({ x: Math.random() * innerWidth, y: -10, vx: rand(-1, 1), vy: rand(2, 5), g: 0.03, life: 260, c: pickOne(COLORS), w: rand(6, 12), h: rand(4, 8), r: rand(0, 6), vr: rand(-0.15, 0.15) });
      }
      cx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life-- > 0 && p.y < innerHeight + 30);
      for (const p of parts) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.r += p.vr;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, p.life / 30);
        cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
      }
      if (parts.length || now < confettiUntil) requestAnimationFrame(tick);
      else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
    };
    requestAnimationFrame(tick);
  }
  return {
    burst(x, y, n = 60, colors = COLORS) {
      if (REDUCE) return; ensure();
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = rand(3, 12);
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: 0.25, life: rand(40, 75), c: colors[i % colors.length], w: rand(3, 8), h: rand(3, 8), r: rand(0, 6), vr: rand(-0.2, 0.2) });
      }
      loop();
    },
    burstAt(el, n, colors) { const r = el.getBoundingClientRect(); this.burst(r.left + r.width / 2, r.top + r.height / 2, n, colors); },
    confetti(ms) { if (REDUCE) return; ensure(); confettiUntil = performance.now() + ms; loop(); },
    flash(kind = "") {
      let f = document.querySelector(".flash");
      if (!f) { f = document.createElement("div"); f.className = "flash"; document.body.append(f); }
      f.className = "flash " + kind; void f.offsetWidth; f.classList.add("go");
    },
    shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); },
  };
})();

function copyResult(text, toastEl) {
  const ok = () => (toastEl.textContent = "복사했어. 단톡방에 붙여넣기!");
  const fail = () => (toastEl.textContent = text);
  try { navigator.clipboard.writeText(text).then(ok, fail); } catch { fail(); }
}

// 최고 기록 (이 브라우저에만 저장)
const Best = {
  get(key) { try { return Number(localStorage.getItem("suyongso:" + key)) || 0; } catch { return 0; } },
  set(key, v) { try { localStorage.setItem("suyongso:" + key, String(v)); } catch {} },
};
