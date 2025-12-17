import { paden } from "../paden";
import { loginMetEmail } from "../../features/login/api/login";
import { loginSchermHtml } from "../../features/login/ui/loginScherm";

function qs<T extends Element>(sel: string) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Niet gevonden: ${sel}`);
  return el as T;
}

export function toonLoginPagina() {
  const view = qs<HTMLElement>("#weergave");
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

      // succes → naar medewerker
      window.history.pushState({}, "", paden.medewerker);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      fout.textContent = "Inloggen mislukt. Check e-mail/wachtwoord.";
    }
  });
}