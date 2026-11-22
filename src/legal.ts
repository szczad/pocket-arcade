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
    nav.setAttribute('aria-label', t('Legal information'));
    privacy.textContent = t('Privacy policy');
    terms.textContent = t('Terms of use');
    const content = current === 'privacy' ? t(`
      <h2>Information we use</h2><p>Endless Loop provides Pocket Arcade. You can play without an account. Guest best scores, theme, language and audio settings may be stored in your browser. If browser storage is unavailable, these preferences and records last only for the session.</p>
      <p>If you sign in with Google, Google handles authentication and Supabase provides account services. The app uses your account identifier and email address, and stores your account theme and personal best scores. Achievements are derived from those scores. Guest scores are transferred to your account only if you choose to merge them.</p>
      <h2>How information is used and shared</h2><p>We use this information to provide sign-in, remember preferences and save your records across devices. Vercel hosts the application; Supabase provides authentication and database services; Google provides sign-in. These services may process technical information such as IP addresses and request logs under their own policies.</p>
      <h2>Storage and your choices</h2><p>You can play as a guest, sign out, or clear browser storage to remove locally stored guest records and preferences. Clearing browser data may also sign you out. Account records remain associated with your account; deleting an account deletes its associated records. Browser storage is also used to maintain your sign-in session.</p>
      <h2>GDPR rights</h2><p>Where the EU General Data Protection Regulation (GDPR) applies, you may have the right to access, correct or erase your personal data, restrict or object to processing, and receive portable data. These rights are subject to legal conditions and exceptions. Where processing relies on consent, you may withdraw it at any time without affecting earlier processing.</p>
      <p>You may also lodge a complaint with a data protection supervisory authority, including the authority in your EU country of residence or work. In Poland, this is the <a href="https://uodo.gov.pl/">President of the Personal Data Protection Office (UODO)</a>.</p>
      <p>Privacy rights, retention periods and international transfers depend on applicable law and the configuration of our service providers. This policy may be updated as the service changes.</p>`) : t(`
      <h2>Using Pocket Arcade</h2><p>Pocket Arcade is provided by Endless Loop. You may play as a guest or sign in using an available provider. You are responsible for your account and for complying with applicable laws when using the service.</p>
      <h2>Fair use</h2><p>Do not disrupt the service, attempt unauthorized access, interfere with other users, or use it unlawfully. Personal bests are client-reported and are not competitive rankings.</p>
      <h2>Availability and content</h2><p>Games, features and account services may change or become unavailable. Keep your own copies of anything important; records may be lost. The service is provided as available, without guarantees of uninterrupted operation, to the extent permitted by law. Nothing in these terms limits rights that cannot legally be excluded.</p>
      <h2>Changes</h2><p>Endless Loop may update these terms as the service changes. The current terms are available here. You may stop using the service if you do not accept them.</p>`);
    dialog.innerHTML = `<div class="legal-head"><h1 id="legal-title">${current === 'privacy' ? privacy.textContent : terms.textContent}</h1><button type="button" class="icon-button" aria-label="${t('Close')}">×</button></div>${content}`;
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
