import { paden } from "./paden";
import { toonLoginPagina } from "./paginas/login.pagina";
import { toonMedewerkerPagina } from "./paginas/medewerker.pagina";

function huidigePad() {
  return window.location.pathname || "/";
}

export function startRouter() {
  const render = () => {
    const pad = huidigePad();

    if (pad === "/" || pad === paden.login) return toonLoginPagina();
    if (pad === paden.medewerker) return toonMedewerkerPagina();

    return toonLoginPagina();
  };

  window.addEventListener("popstate", render);
  render();
}