import { Html5Qrcode } from "html5-qrcode";
import { getHuidigeUser } from "../../../../login/model/authToestand";
import { slaPakketOp } from "./api/pakketten.opslaan";
import { initGeluid, piepScan, piepOpgeslagen, piepFout } from "../../../../../shared/helpers/geluid";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

const VERVOERDERS = [
  "DHL",
  "DHL Express",
  "PostNL",
  "Mondial Relay",
  "VintedGo",
  "DPD",
  "UPS",
  "GLS",
  "Overig"
] as const;

type Vervoerder = (typeof VERVOERDERS)[number];

export function toonInscannenPagina() {
  const view = qs<HTMLElement>("#weergave");

  // ✅ onthoud laatste vervoerder (handig voor werkmodus)
  let gekozenVervoerder: Vervoerder | "" =
    (localStorage.getItem("gekozenVervoerder") as Vervoerder | null) ?? "";

  view.innerHTML = `
    <section class="kaart">
      <h1>Inscannen</h1>
      <p class="sub">Kies eerst de vervoerder. Scan daarna de barcode en sla op.</p>

      <div class="resultaat" style="margin-top:12px;">
        <div class="label">Vervoerder</div>
        <div id="vervoerderKeuze" class="vervoerderGrid">
          ${VERVOERDERS.map((v) => {
            const active = gekozenVervoerder === v ? "is-actief" : "";
            return `<button type="button" class="vervoerderTegel ${active}" data-vervoerder="${v}">${v}</button>`;
          }).join("")}
        </div>
        <div id="vervoerderHuidig" class="sub" style="margin-top:10px;">
          ${gekozenVervoerder ? `Gekozen: <strong>${gekozenVervoerder}</strong>` : `Nog niet gekozen.`}
        </div>
      </div>

      <div class="scannerBox" style="margin-top:12px;">
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

        <div class="rij">
          <button id="onbekendKnop" class="knop knop--sec" type="button">Onbekend</button>
          <button id="opslaanKnop" class="knop" type="submit">Next</button>
        </div>
      </form>

      <div id="melding" class="sub" style="margin-top:10px;"></div>
      <div id="fout" class="fout" aria-live="polite"></div>
    </section>
  `;

  const vervoerderKeuze = qs<HTMLDivElement>("#vervoerderKeuze");
  const vervoerderHuidig = qs<HTMLDivElement>("#vervoerderHuidig");

  const startKnop = qs<HTMLButtonElement>("#startScan");
  const stopKnop = qs<HTMLButtonElement>("#stopScan");
  const codeEl = qs<HTMLDivElement>("#code");
  const foutEl = qs<HTMLDivElement>("#fout");
  const meldingEl = qs<HTMLDivElement>("#melding");

  const form = qs<HTMLFormElement>("#opslaanForm");
  const voornaamEl = qs<HTMLInputElement>("#voornaam");
  const achternaamEl = qs<HTMLInputElement>("#achternaam");
  const onbekendKnop = qs<HTMLButtonElement>("#onbekendKnop");
  const opslaanKnop = qs<HTMLButtonElement>("#opslaanKnop");

  const scannerId = "scanner";
  const html5Qr = new Html5Qrcode(scannerId);

  let actief = false;
  let laatsteBarcode = "";

  function zetVervoerder(nieuw: Vervoerder) {
    gekozenVervoerder = nieuw;
    localStorage.setItem("gekozenVervoerder", nieuw);

    // UI highlight
    vervoerderKeuze.querySelectorAll<HTMLButtonElement>(".vervoerderTegel").forEach((btn) => {
      btn.classList.toggle("is-actief", btn.dataset.vervoerder === nieuw);
    });

    vervoerderHuidig.innerHTML = `Gekozen: <strong>${nieuw}</strong>`;
  }

  vervoerderKeuze.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".vervoerderTegel");
    if (!btn) return;
    const v = btn.dataset.vervoerder as Vervoerder;
    if (v) zetVervoerder(v);
  });

  function resetUI() {
    foutEl.textContent = "";
    meldingEl.textContent = "";
    codeEl.textContent = "—";
    form.style.display = "none";
    laatsteBarcode = "";
  }

  async function start() {
    resetUI();

    if (!gekozenVervoerder) {
      piepFout();
      foutEl.textContent = "Kies eerst een vervoerder (DHL/PostNL/etc.).";
      return;
    }

    try {
      const cams = await Html5Qrcode.getCameras();
      if (!cams || cams.length === 0) {
        foutEl.textContent = "Geen camera gevonden op dit apparaat.";
        return;
      }

      const voorkeur = cams.find((c) => /back|rear|environment/i.test(c.label)) ?? cams[0];

      actief = true;
      startKnop.disabled = true;
      stopKnop.disabled = false;

      await html5Qr.start(
        { deviceId: { exact: voorkeur.id } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          piepScan();

          laatsteBarcode = (decodedText || "").trim();
          codeEl.textContent = laatsteBarcode;

          // stop scanner zodat je niet dubbel scant terwijl je typt
          await stop();

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

  startKnop.addEventListener("click", () => {
    initGeluid();
    start();
  });

  stopKnop.addEventListener("click", () => stop());

  onbekendKnop.addEventListener("click", () => {
    voornaamEl.value = "Onbekend";
    achternaamEl.value = "Onbekend";
    achternaamEl.focus();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    foutEl.textContent = "";
    meldingEl.textContent = "";

    const user = getHuidigeUser();
    if (!user) {
      piepFout();
      foutEl.textContent = "Niet ingelogd.";
      return;
    }

    const barcode = (laatsteBarcode || "").trim();
    if (!barcode) {
      piepFout();
      foutEl.textContent = "Scan eerst een barcode.";
      return;
    }

    if (!gekozenVervoerder) {
      piepFout();
      foutEl.textContent = "Kies eerst een vervoerder.";
      return;
    }

    opslaanKnop.disabled = true;

    try {
      await slaPakketOp({
        barcode,
        vervoerder: gekozenVervoerder,
        voornaam: voornaamEl.value,
        achternaam: achternaamEl.value,
        aangemaaktDoorUid: user.uid,
        aangemaaktDoorEmail: user.email ?? null
      });

      piepOpgeslagen();
      meldingEl.textContent = `✅ Opgeslagen onder ${gekozenVervoerder}. Scan volgende…`;

      form.reset();
      form.style.display = "none";
      laatsteBarcode = "";
      codeEl.textContent = "—";
    } catch (err: any) {
      piepFout();
      foutEl.textContent = err?.message ?? "Opslaan mislukt.";
    } finally {
      opslaanKnop.disabled = false;
    }
  });

  window.addEventListener("popstate", () => stop());
}