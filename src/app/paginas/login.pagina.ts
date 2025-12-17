import { paden } from "../paden";
import { loginMetEmail } from "../../features/login/api/login";
import { loginSchermHtml, loginLadenHtml } from "../../features/login/ui/loginScherm";
import { getHuidigeUser, isAuthKlaar } from "../../features/login/model/authToestand";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

export function toonLoginPagina() {
  const view = qs<HTMLElement>("#weergave");

  // ✅ zolang auth nog niet klaar is: laden
  if (!isAuthKlaar()) {
    view.innerHTML = loginLadenHtml();
    return;
  }

  // ✅ al ingelogd → door
  if (getHuidigeUser()) {
    window.history.replaceState({}, "", paden.medewerker);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  // anders: normaal login scherm
  view.innerHTML = loginSchermHtml();

  const form = qs<HTMLFormElement>("#loginForm");
  const fout = qs<HTMLDivElement>("#fout");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    fout.textContent = "";

    const email = (qs<HTMLInputElement>("#email").value || "").trim();
    const wachtwoord = qs<HTMLInputElement>("#wachtwoord").value;

    try {
      await loginMetEmail(email, wachtwoord);
      window.history.pushState({}, "", paden.medewerker);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      fout.textContent = "Inloggen mislukt. Check e-mail/wachtwoord.";
    }
  });
}