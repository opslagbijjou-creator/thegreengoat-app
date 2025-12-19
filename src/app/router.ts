import { paden } from "./paden";

import { toonLoginPagina } from "./paginas/login.pagina";
import { toonMedewerkerPagina } from "./paginas/medewerker.pagina";
import { toonMedewerkerInscannenPagina } from "./paginas/medewerkerInscannen.pagina";
import { toonMedewerkerAfhalenPagina } from "./paginas/medewerkerAfhalen.pagina";
import { toonMedewerkerZoekenPagina } from "./paginas/medewerkerZoeken.pagina";

import { startAuthToestand, onAuthUpdate } from "../features/login/model/authToestand";

function huidigePad() {
  return window.location.pathname || "/";
}

export function startRouter() {
  startAuthToestand();

  const render = () => {
    const pad = huidigePad();

    if (pad === "/" || pad === paden.login) return toonLoginPagina();

    if (pad === paden.medewerker) return toonMedewerkerPagina();
    if (pad === paden.medewerkerInscannen) return toonMedewerkerInscannenPagina();
    if (pad === paden.medewerkerAfhalen) return toonMedewerkerAfhalenPagina();
    if (pad === paden.medewerkerZoeken) return toonMedewerkerZoekenPagina();

    return toonLoginPagina();
  };

  window.addEventListener("popstate", render);
  onAuthUpdate(render);

  render();
}