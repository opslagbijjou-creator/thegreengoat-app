export function loginSchermHtml() {
  return `
  <section class="kaart">
    <h1>Inloggen</h1>
    <p class="sub">Log in met je account.</p>

    <form id="loginForm" class="formulier">
      <label class="veld">
        <span>E-mail</span>
        <input id="email" type="email" autocomplete="username" required placeholder="naam@bedrijf.nl" />
      </label>

      <label class="veld">
        <span>Wachtwoord</span>
        <input id="wachtwoord" type="password" autocomplete="current-password" required placeholder="••••••••" />
      </label>

      <button class="knop" type="submit">Inloggen</button>
      <div id="fout" class="fout" aria-live="polite"></div>
    </form>
  </section>
  `;
}

export function loginLadenHtml() {
  return `
  <section class="kaart">
    <h1>Even laden…</h1>
    <p class="sub">We controleren je sessie.</p>
  </section>
  `;
}