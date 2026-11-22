import { t } from './i18n';

export interface Achievement {
  name: () => string;
  description: () => string;
  goal: number;
  icon: string;
}

/** The same accessible achievement badges are used in games and on the account page. */
export function achievementIcons(items: readonly Achievement[], score: number | undefined): HTMLElement {
  const icons = document.createElement('div');
  icons.className = 'achievement-icons';
  for (const item of items) {
    const earned = (score ?? -1) >= item.goal;
    const icon = document.createElement('button');
    icon.type = 'button';
    icon.className = `achievement-icon ${earned ? 'earned' : 'locked'}`;
    icon.setAttribute('aria-label', `${item.name()}: ${item.description()} — ${earned ? t('Earned') : t('Locked')}`);
    const mark = document.createElement('span');
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = item.icon;
    const tip = document.createElement('span');
    tip.className = 'achievement-tip';
    tip.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = item.name();
    const description = document.createElement('span');
    description.textContent = item.description();
    const state = document.createElement('small');
    state.textContent = earned ? t('EARNED') : t('LOCKED');
    tip.append(name, description, state);
    icon.append(mark, tip);
    icons.append(icon);
  }
  return icons;
}
