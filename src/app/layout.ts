export function mountLayout() {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) throw new Error("Niet gevonden: #app");

  root.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="logo">🐐</div>
          <div>
            <div class="brand__name">TheGreenGoat</div>
            <div class="brand__tag">Pakketpunt</div>
          </div>
        </div>
      </header>

      <main class="content" id="weergave"></main>

      <footer class="footer">© ${new Date().getFullYear()} TheGreenGoat</footer>
    </div>
  `;
}