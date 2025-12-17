import { Html5Qrcode } from "html5-qrcode";
import { getHuidigeUser } from "../../../../login/model/authToestand";
import { leesPakket, type PakketDoc } from "./api/pakketten.lezen";
import { markeerAfgehaald } from "./api/pakketten.afhalen";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

export function toonAfhalenPagina() {
  const view = qs<HTMLElement>("#weergave");

  view.innerHTML = `
    <section class="kaart">
      <h1>Afhalen</h1>
      <p class="sub">Scan de barcode om het pakket te zoeken.</p>

      <div class="scannerBox">
        <div id="scannerAfhalen" class="scanner"></div>
      </div>

      <div class="rij">
        <button id="startScan" class="knop" type="button">Scan starten</button>
        <button id="stopScan" class="knop knop--sec" type="button" disabled>Stop</button>
      </div>

      <div class="resultaat">
        <div class="label">Barcode</div>
        <div id="barcode" class="code">—</div>
      </div>

      <div id="pakketKaart" style="display:none; margin-top:12px;">
        <div class="resultaat">
          <div class="label">Pakket</div>
          <div id="pakketInfo" class="code">—</div>
          <div id="statusInfo" class="sub" style="margin-top:8px;"></div>
        </div>

        <div class="rij" style="margin-top:12px;">
          <button id="afgevenKnop" class="knop" type="button">Afgegeven</button>
        </div>
      </div>

      <div id="melding" class="sub" style="margin-top:10px;"></div>
      <div id="fout" class="fout" aria-live="polite"></div>
    </section>
  `;

  const startKnop = qs<HTMLButtonElement>("#startScan");
  const stopKnop = qs<HTMLButtonElement>("#stopScan");
  const barcodeEl = qs<HTMLDivElement>("#barcode");
  const foutEl = qs<HTMLDivElement>("#fout");
  const meldingEl = qs<HTMLDivElement>("#melding");

  const pakketKaart = qs<HTMLDivElement>("#pakketKaart");
  const pakketInfo = qs<HTMLDivElement>("#pakketInfo");
  const statusInfo = qs<HTMLDivElement>("#statusInfo");
  const afgevenKnop = qs<HTMLButtonElement>("#afgevenKnop");

  const scannerId = "scannerAfhalen";
  const html5Qr = new Html5Qrcode(scannerId);

  let actief = false;
  let laatsteBarcode = "";
  let gevondenPakket: PakketDoc | null = null;

  function resetUI() {
    foutEl.textContent = "";
    meldingEl.textContent = "";
    barcodeEl.textContent = "—";
    pakketKaart.style.display = "none";
    gevondenPakket = null;
    laatsteBarcode = "";
  }

  async function start() {
    resetUI();

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
        async (decodedText) => {
          // barcode gevonden
          laatsteBarcode = decodedText.trim();
          barcodeEl.textContent = laatsteBarcode;

          // zoek in Firestore
          try {
            const pakket = await leesPakket(laatsteBarcode);
            if (!pakket) {
              pakketKaart.style.display = "none";
              foutEl.textContent = "Niet gevonden: deze barcode staat niet in het systeem.";
              return;
            }

            gevondenPakket = pakket;
            pakketKaart.style.display = "block";
            pakketInfo.textContent = `${pakket.voornaam} ${pakket.achternaam}`.trim() || "(geen naam)";
            statusInfo.textContent =
              pakket.status === "afgehaald"
                ? "⚠️ Dit pakket is al afgehaald."
                : "✅ Klaar om af te geven.";

          } catch (e: any) {
            foutEl.textContent = e?.message ?? "Zoeken mislukt.";
          }
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

  afgevenKnop.addEventListener("click", async () => {
    foutEl.textContent = "";
    meldingEl.textContent = "";

    const user = getHuidigeUser();
    if (!user) {
      foutEl.textContent = "Niet ingelogd.";
      return;
    }

    if (!gevondenPakket || !laatsteBarcode) {
      foutEl.textContent = "Scan eerst een barcode.";
      return;
    }

    if (gevondenPakket.status === "afgehaald") {
      foutEl.textContent = "Dit pakket is al afgehaald.";
      return;
    }

    afgevenKnop.disabled = true;

    try {
      await markeerAfgehaald(laatsteBarcode, user.uid, user.email ?? null);
      meldingEl.textContent = "✅ Pakket gemarkeerd als afgehaald.";
      statusInfo.textContent = "⚠️ Dit pakket is nu afgehaald.";
      gevondenPakket = { ...gevondenPakket, status: "afgehaald" };
    } catch (e: any) {
      foutEl.textContent = e?.message ?? "Updaten mislukt.";
    } finally {
      afgevenKnop.disabled = false;
    }
  });

  // als je weg navigeert → scanner stoppen
  window.addEventListener("popstate", () => stop());
}