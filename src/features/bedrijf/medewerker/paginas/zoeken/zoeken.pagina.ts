import { paden } from "../../../../../app/paden";
import { getHuidigeUser, isAuthKlaar } from "../../../../login/model/authToestand";
import { zoekPakketten, type PakketResultaat } from "./api/pakketten.zoeken";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

export function toonZoekenPagina() {
  const view = qs<HTMLElement>("#weergave");

  if (!isAuthKlaar()) {
    view.innerHTML = `
      <section class="kaart">
        <h1>Even laden…</h1>
        <p class="sub">We controleren je sessie.</p>
      </section>
    `;
    return;
  }

  const user = getHuidigeUser();
  if (!user) {
    window.history.replaceState({}, "", paden.login);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  view.innerHTML = `
    <section class="kaart">
      <h1>Zoeken</h1>
      <p class="sub">Zoek op barcode of naam (exact).</p>

      <div class="formulier" style="margin-top:12px;">
        <label class="veld">
          <span>Zoekterm</span>
          <input id="q" placeholder="Bijv. 3S... of Fatima of Munach" />
        </label>

        <div class="rij">
          <button id="zoek" class="knop" type="button">Zoeken</button>
          <button id="terug" class="knop knop--sec" type="button">Terug</button>
        </div>
      </div>

      <div id="status" class="sub" style="margin-top:10px;"></div>
      <div id="fout" class="fout" aria-live="polite"></div>

      <div id="lijst" style="margin-top:12px;"></div>
    </section>
  `;

  const q = qs<HTMLInputElement>("#q");
  const zoekKnop = qs<HTMLButtonElement>("#zoek");
  const terugKnop = qs<HTMLButtonElement>("#terug");
  const status = qs<HTMLDivElement>("#status");
  const fout = qs<HTMLDivElement>("#fout");
  const lijst = qs<HTMLDivElement>("#lijst");

  terugKnop.addEventListener("click", () => window.history.back());

  async function runZoek() {
    fout.textContent = "";
    status.textContent = "";
    lijst.innerHTML = "";

    const term = (q.value || "").trim();
    if (!term) {
      fout.textContent = "Vul een zoekterm in.";
      return;
    }

    zoekKnop.disabled = true;
    status.textContent = "Zoeken…";

    try {
      const resultaten: PakketResultaat[] = await zoekPakketten(term);

      if (resultaten.length === 0) {
        status.textContent = "";
        lijst.innerHTML = `<div class="sub">Geen resultaten.</div>`;
        return;
      }

      status.textContent = `Gevonden: ${resultaten.length}`;

      lijst.innerHTML = resultaten
        .map((p) => {
          const naam = `${p.achternaam ?? ""} ${p.voornaam ?? ""}`.trim() || "Onbekend";
          return `
            <div class="vervoerderRow" style="align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-weight:700;">${naam}</div>
                <div class="sub">${p.barcode ?? "—"}</div>
                <div class="sub">
                  Status: <strong>${p.status ?? "—"}</strong>
                  ${p.vervoerder ? ` • ${p.vervoerder}` : ""}
                </div>
                ${p.adres ? `<div class="sub">${p.adres}</div>` : ""}
              </div>
            </div>
          `;
        })
        .join("");
    } catch (e: any) {
      fout.textContent = e?.message ?? "Zoeken mislukt.";
      status.textContent = "";
    } finally {
      zoekKnop.disabled = false;
    }
  }

  zoekKnop.addEventListener("click", runZoek);
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runZoek();
  });
}