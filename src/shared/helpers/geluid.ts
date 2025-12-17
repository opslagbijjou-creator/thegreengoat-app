let ctx: AudioContext | null = null;

export function initGeluid() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // iOS: context kan "suspended" zijn tot user gesture
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}

function beep(freq: number, duurMs: number, volume = 0.05) {
  if (!ctx) return;

  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "sine";
  o.frequency.value = freq;

  g.gain.value = volume;

  o.connect(g);
  g.connect(ctx.destination);

  const now = ctx.currentTime;
  o.start(now);
  o.stop(now + duurMs / 1000);
}

export function piepScan() {
  // kort, wat hoger
  beep(1100, 70);
}

export function piepOpgeslagen() {
  // iets lager + iets langer (duidelijk verschil)
  beep(650, 120);
}

export function piepFout() {
  // fout-signaal (optioneel)
  beep(220, 160, 0.07);
}