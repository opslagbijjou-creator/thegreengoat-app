import { Html5Qrcode } from "html5-qrcode";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

export function toonInscannenPagina() {
  const view = qs<HTMLElement>("#weergave");

  view.innerHTML = `
    <section class="kaart">
      <h1>Inscannen</h1>
      <p class="sub">Druk op “Scan starten” en richt op de barcode.</p>

      <div class="scannerBox">
        <div id="scanner" class="scanner"></div>
      </div>

      <div class="rij">
        <button id="startScan" class="knop" type="button">Scan starten</button>
        <button id="stopScan" class="knop knop--sec" type="button" disabled>Stop</button>
      </div>

      <div class="resultaat">
        <div class="label">Gescande code</div>
        <div id="code" class="code">—</div>
      </div>

      <div id="fout" class="fout" aria-live="polite"></div>
    </section>
  `;

  const startKnop = qs<HTMLButtonElement>("#startScan");
  const stopKnop = qs<HTMLButtonElement>("#stopScan");
  const codeEl = qs<HTMLDivElement>("#code");
  const foutEl = qs<HTMLDivElement>("#fout");

  const scannerId = "scanner";
  const html5Qr = new Html5Qrcode(scannerId);

  let actief = false;

  async function start() {
    foutEl.textContent = "";
    codeEl.textContent = "—";

    try {
      // camera kiezen (liefst back camera)
      const cams = await Html5Qrcode.getCameras();
      if (!cams || cams.length === 0) {
        foutEl.textContent = "Geen camera gevonden op dit apparaat.";
        return;
      }

      const voorkeur = cams.find(c => /back|rear|environment/i.test(c.label)) ?? cams[0];

      actief = true;
      startKnop.disabled = true;
      stopKnop.disabled = false;

      await html5Qr.start(
        { deviceId: { exact: voorkeur.id } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // ✅ barcode gevonden
          codeEl.textContent = decodedText;

          // Optional: automatisch stoppen na 1 scan
          stop().catch(() => {});
        },
        () => {
          // scan errors negeren (continue scanning)
        }
      );
    } catch (e: any) {
      actief = false;
      startKnop.disabled = false;
      stopKnop.disabled = true;
      foutEl.textContent = e?.message ?? "Scanner kon niet starten. Check camera permissies.";
    }
  }

  async function stop() {
    if (!actief) return;
    actief = false;

    try {
      await html5Qr.stop();
      await html5Qr.clear();
    } catch {
      // ignore
    } finally {
      startKnop.disabled = false;
      stopKnop.disabled = true;
    }
  }

  // knop events
  startKnop.addEventListener("click", () => start());
  stopKnop.addEventListener("click", () => stop());

  // ✅ als je weg navigeert → scanner stoppen
  const onNav = () => stop();
  window.addEventListener("popstate", onNav);

  // Extra safety: als pagina opnieuw wordt gerenderd, oude scanner stoppen
  // (we verwijderen listener als we stop aanroepen via nav)
  // Hier simpel gehouden: als je weg gaat stopt hij door popstate.
}