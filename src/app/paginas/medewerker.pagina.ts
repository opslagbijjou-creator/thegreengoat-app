export function toonMedewerkerPagina() {
  const view = document.querySelector<HTMLElement>("#weergave");
  if (!view) throw new Error("Niet gevonden: #weergave");

  view.innerHTML = `
    <section class="kaart">
      <h1>Medewerker</h1>
      <p class="sub">Je bent ingelogd ✅</p>
    </section>
  `;
}