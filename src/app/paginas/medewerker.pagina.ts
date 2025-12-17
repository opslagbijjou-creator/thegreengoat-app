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
      <p class="sub">Ingelogd als: <strong>${user.email ?? "onbekend"}</strong></p>
      <button id="logoutKnop" class="knop" type="button">Uitloggen</button>
    </section>
  `;

  const knop = document.querySelector<HTMLButtonElement>("#logoutKnop");
  knop?.addEventListener("click", async () => {
    await logout();
    window.history.replaceState({}, "", paden.login);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}