export function toonMedewerkerInscannenPagina() {
  const view = document.querySelector<HTMLElement>("#weergave");
  if (!view) throw new Error("Niet gevonden: #weergave");

  view.innerHTML = `
    <section class="kaart">
      <h1>Inscannen</h1>
      <p class="sub">Komt zo. (Eerst alleen navigatie)</p>
    </section>
  `;
}