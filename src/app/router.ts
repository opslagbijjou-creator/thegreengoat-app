import { paden } from "./paden";
import { toonLoginPagina } from "./paginas/login.pagina";
import { toonMedewerkerPagina } from "./paginas/medewerker.pagina";
import { startAuthToestand, onAuthUpdate } from "../features/login/model/authToestand";

function huidigePad() {
  return window.location.pathname || "/";
}

export function startRouter() {
  // ✅ start auth observer 1x
  startAuthToestand();

  const render = () => {
    const pad = huidigePad();

    if (pad === "/" || pad === paden.login) return toonLoginPagina();
    if (pad === paden.medewerker) return toonMedewerkerPagina();

    return toonLoginPagina();
  };

  window.addEventListener("popstate", render);

  // ✅ als auth verandert (login/logout/refresh) → opnieuw renderen
  onAuthUpdate(render);

  render();
}