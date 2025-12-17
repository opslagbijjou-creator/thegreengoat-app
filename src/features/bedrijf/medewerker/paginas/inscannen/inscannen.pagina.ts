import { Html5Qrcode } from "html5-qrcode";
import { getHuidigeUser } from "../../../../login/model/authToestand";
import { slaPakketOp } from "./api/pakketten.opslaan";

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
      <p class="sub">Scan de barcode. Vul daarna naam in en sla op.</p>

      <div class="scannerBox">
        <div id="scanner" class="scanner"></div>
      </div>

      <div class="rij">
        <button id="startScan" class="knop" type="button">Scan starten</button>
        <button id="stopScan" class="knop knop--sec" type="button" disabled>Stop</button>
      </div>

      <div class="resultaat">
        <div class="label">Gescande barcode</div>
        <div id="code" class="code">—</div>
      </div>

      <form id="opslaanForm" class="formulier" style="margin-top:12px; display:none;">
        <label class="veld">
          <span>Voornaam</span>
          <input id="voornaam" required placeholder="Fatima" />
        </label>
        <label class="veld">
          <span>Achternaam</span>
          <input id="achternaam" required placeholder="Munach" />
        </label>

        <button id="opslaanKnop" class="knop" type="submit">Opslaan</button>
      </form>

      <div id="melding" class="sub" style="margin-top:10px;"></div>
      <div id="fout" class="fout" aria-live="polite"></div>
    </section>
  `;

  const startKnop = qs<HTMLButtonElement>("#startScan");
  const stopKnop = qs<HTMLButtonElement>("#stopScan");
  const codeEl = qs<HTMLDivElement>("#code");
  const foutEl = qs<HTMLDivElement>("#fout");
  const meldingEl = qs<HTMLDivElement>("#melding");

  const form = qs<HTMLFormElement>("#opslaanForm");
  const voornaamEl = qs<HTMLInputElement>("#voornaam");
  const achternaamEl = qs<HTMLInputElement>("#achternaam");
  const opslaanKnop = qs<HTMLButtonElement>("#opslaanKnop");

  const scannerId = "scanner";
  const html5Qr = new Html5Qrcode(scannerId);

  let actief = false;
  let laatsteBarcode = "";

  async function start() {
    foutEl.textContent = "";
    meldingEl.textContent = "";
    codeEl.textContent = "—";
    form.style.display = "none";
    laatsteBarcode = "";

    try {
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
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // ✅ barcode gevonden
          laatsteBarcode = decodedText;
          codeEl.textContent = decodedText;

          // toon form om op te slaan
          form.style.display = "grid";
          voornaamEl.focus();
        },
        () => {}
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

  startKnop.addEventListener("click", () => start());
  stopKnop.addEventListener("click", () => stop());

  // Opslaan naar Firestore
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    foutEl.textContent = "";
    meldingEl.textContent = "";

    const user = getHuidigeUser();
    if (!user) {
      foutEl.textContent = "Niet ingelogd.";
      return;
    }

    const barcode = (laatsteBarcode || "").trim();
    if (!barcode) {
      foutEl.textContent = "Scan eerst een barcode.";
      return;
    }

    opslaanKnop.disabled = true;

    try {
      await slaPakketOp({
        barcode,
        voornaam: voornaamEl.value,
        achternaam: achternaamEl.value,
        aangemaaktDoorUid: user.uid,
        aangemaaktDoorEmail: user.email ?? null
      });

      meldingEl.textContent = "✅ Opgeslagen!";
      form.reset();
      form.style.display = "none";
      laatsteBarcode = "";
      codeEl.textContent = "—";

    } catch (err: any) {
      foutEl.textContent = err?.message ?? "Opslaan mislukt.";
    } finally {
      opslaanKnop.disabled = false;
    }
  });

  // als je weg navigeert → scanner stoppen
  window.addEventListener("popstate", () => stop());
}