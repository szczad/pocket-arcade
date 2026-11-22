import { onLanguageChange, t } from './i18n';

/** Adds accessible legal documents without navigating away from a game. */
export function setupLegal(beforeOpen: () => void): void {
  const nav = document.createElement('nav');
  nav.className = 'legal-links';
  const privacy = document.createElement('button');
  const terms = document.createElement('button');
  privacy.type = terms.type = 'button';
  nav.append(privacy, terms);
  document.querySelector('footer')!.append(nav);

  const dialog = document.createElement('dialog');
  dialog.className = 'legal-dialog';
  dialog.setAttribute('aria-labelledby', 'legal-title');
  document.body.append(dialog);
  let current: 'privacy' | 'terms' = 'privacy';
  let opener: HTMLElement | null = null;
  const render = () => {
    nav.setAttribute('aria-label', t('Legal information', 'Informacje prawne'));
    privacy.textContent = t('Privacy policy', 'Polityka prywatności');
    terms.textContent = t('Terms of use', 'Warunki korzystania');
    const content = current === 'privacy' ? t(`
      <h2>Information we use</h2><p>Endless Loop provides Pocket Arcade. You can play without an account. Guest best scores, theme, language and audio settings may be stored in your browser. If browser storage is unavailable, these preferences and records last only for the session.</p>
      <p>If you sign in with Google, Google handles authentication and Supabase provides account services. The app uses your account identifier and email address, and stores your account theme and personal best scores. Achievements are derived from those scores. Guest scores are transferred to your account only if you choose to merge them.</p>
      <h2>How information is used and shared</h2><p>We use this information to provide sign-in, remember preferences and save your records across devices. Vercel hosts the application; Supabase provides authentication and database services; Google provides sign-in. These services may process technical information such as IP addresses and request logs under their own policies.</p>
      <h2>Storage and your choices</h2><p>You can play as a guest, sign out, or clear browser storage to remove locally stored guest records and preferences. Clearing browser data may also sign you out. Account records remain associated with your account; deleting an account deletes its associated records. Browser storage is also used to maintain your sign-in session.</p>
      <p>Privacy rights, retention periods and international transfers depend on applicable law and the configuration of our service providers. This policy may be updated as the service changes.</p>`, `
      <h2>Wykorzystywane informacje</h2><p>Endless Loop udostępnia Pocket Arcade. Możesz grać bez konta. Rekordy gościa, motyw, język i ustawienia dźwięku mogą być zapisane w przeglądarce. Jeśli pamięć przeglądarki jest niedostępna, ustawienia i rekordy pozostają tylko na czas sesji.</p>
      <p>Jeśli zalogujesz się przez Google, Google obsługuje uwierzytelnianie, a Supabase usługi konta. Aplikacja używa identyfikatora i adresu e-mail konta oraz zapisuje motyw i rekordy konta. Osiągnięcia wynikają z rekordów. Rekordy gościa są przenoszone na konto tylko po wybraniu połączenia.</p>
      <h2>Wykorzystanie i udostępnianie informacji</h2><p>Informacje służą do logowania, zapamiętywania ustawień i przechowywania rekordów na różnych urządzeniach. Vercel hostuje aplikację; Supabase zapewnia uwierzytelnianie i bazę danych; Google zapewnia logowanie. Usługi te mogą przetwarzać dane techniczne, takie jak adresy IP i dzienniki żądań, zgodnie z własnymi zasadami.</p>
      <h2>Przechowywanie i Twoje wybory</h2><p>Możesz grać jako gość, wylogować się lub wyczyścić pamięć przeglądarki, aby usunąć lokalne rekordy i ustawienia gościa. Wyczyszczenie danych przeglądarki może również wylogować Cię z konta. Rekordy konta pozostają z nim powiązane; usunięcie konta usuwa powiązane rekordy. Pamięć przeglądarki służy także do utrzymania sesji logowania.</p>
      <p>Prawa do prywatności, okresy przechowywania i przekazywanie danych za granicę zależą od obowiązującego prawa i konfiguracji dostawców usług. Polityka może być aktualizowana wraz ze zmianami usługi.</p>`) : t(`
      <h2>Using Pocket Arcade</h2><p>Pocket Arcade is provided by Endless Loop. You may play as a guest or sign in using an available provider. You are responsible for your account and for complying with applicable laws when using the service.</p>
      <h2>Fair use</h2><p>Do not disrupt the service, attempt unauthorized access, interfere with other users, or use it unlawfully. Personal bests are client-reported and are not competitive rankings.</p>
      <h2>Availability and content</h2><p>Games, features and account services may change or become unavailable. Keep your own copies of anything important; records may be lost. The service is provided as available, without guarantees of uninterrupted operation, to the extent permitted by law. Nothing in these terms limits rights that cannot legally be excluded.</p>
      <h2>Changes</h2><p>Endless Loop may update these terms as the service changes. The current terms are available here. You may stop using the service if you do not accept them.</p>`, `
      <h2>Korzystanie z Pocket Arcade</h2><p>Pocket Arcade jest udostępniane przez Endless Loop. Możesz grać jako gość lub zalogować się za pośrednictwem dostępnego dostawcy. Odpowiadasz za swoje konto i przestrzeganie obowiązującego prawa podczas korzystania z usługi.</p>
      <h2>Uczciwe korzystanie</h2><p>Nie zakłócaj działania usługi, nie próbuj uzyskać nieuprawnionego dostępu, nie przeszkadzaj innym użytkownikom ani nie korzystaj z usługi niezgodnie z prawem. Rekordy są zgłaszane przez klienta i nie stanowią rankingu rywalizacyjnego.</p>
      <h2>Dostępność i treści</h2><p>Gry, funkcje i usługi konta mogą się zmieniać lub stać niedostępne. Zachowuj własne kopie ważnych danych; rekordy mogą zostać utracone. Usługa jest udostępniana w dostępnej postaci, bez gwarancji nieprzerwanego działania, w zakresie dozwolonym przez prawo. Warunki te nie ograniczają praw, których nie można wyłączyć zgodnie z prawem.</p>
      <h2>Zmiany</h2><p>Endless Loop może aktualizować warunki wraz ze zmianami usługi. Aktualne warunki są dostępne tutaj. Jeśli ich nie akceptujesz, możesz przestać korzystać z usługi.</p>`);
    dialog.innerHTML = `<div class="legal-head"><h1 id="legal-title">${current === 'privacy' ? privacy.textContent : terms.textContent}</h1><button type="button" class="icon-button" aria-label="${t('Close', 'Zamknij')}">×</button></div>${content}`;
    dialog.querySelector('button')!.addEventListener('click', () => dialog.close());
  };
  const open = (document: 'privacy' | 'terms', button: HTMLElement) => {
    beforeOpen();
    current = document;
    opener = button;
    render();
    dialog.showModal();
  };
  privacy.addEventListener('click', () => open('privacy', privacy));
  terms.addEventListener('click', () => open('terms', terms));
  dialog.addEventListener('close', () => opener?.focus());
  onLanguageChange(render);
  render();
}
