import { paden } from "../paden";
import { getHuidigeUser, isAuthKlaar } from "../../features/login/model/authToestand";
import { logout } from "../../features/login/api/login";

export function toonMedewerkerPagina() {
  const view = document.querySelector<HTMLElement>("#weergave");
  if (!view) throw new Error("Niet gevonden: #weergave");

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
      <h1>Medewerker</h1>
      <p class="sub">Kies wat je wilt doen.</p>

      <div class="tegels">
        <button class="tegel" id="gaInscannen" type="button">
          <div class="tegel__titel">Inscannen</div>
          <div class="tegel__sub">Nieuwe pakketten toevoegen</div>
        </button>

        <button class="tegel" id="gaAfhalen" type="button">
          <div class="tegel__titel">Afhalen</div>
          <div class="tegel__sub">Pakket afgeven aan klant</div>
        </button>

        <button class="tegel" id="gaZoeken" type="button">
          <div class="tegel__titel">Zoeken</div>
          <div class="tegel__sub">Zoek op barcode/naam</div>
        </button>
      </div>

      <div class="actie-rij">
        <div class="klein">Ingelogd als: <strong>${user.email ?? "onbekend"}</strong></div>
        <button id="logoutKnop" class="knop" type="button">Uitloggen</button>
      </div>
    </section>
  `;

  const nav = (pad: string) => {
    window.history.pushState({}, "", pad);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  document.querySelector<HTMLButtonElement>("#gaInscannen")?.addEventListener("click", () => nav(paden.medewerkerInscannen));
  document.querySelector<HTMLButtonElement>("#gaAfhalen")?.addEventListener("click", () => nav(paden.medewerkerAfhalen));
  document.querySelector<HTMLButtonElement>("#gaZoeken")?.addEventListener("click", () => nav(paden.medewerkerZoeken));

  document.querySelector<HTMLButtonElement>("#logoutKnop")?.addEventListener("click", async () => {
    await logout();
    window.history.replaceState({}, "", paden.login);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}