export function toonMedewerkerAfhalenPagina() {
  const view = document.querySelector<HTMLElement>("#weergave");
  if (!view) throw new Error("Niet gevonden: #weergave");

  view.innerHTML = `
    <section class="kaart">
      <h1>Afhalen</h1>
      <p class="sub">Komt zo. (Eerst alleen navigatie)</p>
    </section>
  `;
}