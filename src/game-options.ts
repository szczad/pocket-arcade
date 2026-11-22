import type { RegisteredGame } from './games';
import type { GameOption, GameSpeed } from './games/types';
import { t } from './i18n';

const speedOption = {
  id: 'speed', kind: 'select', label: 'Game speed', defaultValue: 'medium',
  choices: [{ value: 'slow', label: 'Slow' }, { value: 'medium', label: 'Medium' }, { value: 'fast', label: 'Fast' }],
} satisfies GameOption;

export function createGameOptions(container: HTMLElement, onChange: () => void) {
  const values = new Map<RegisteredGame, Record<string, string>>();
  // The cabinet speed picker is shared across the games that support it.
  let speed: GameSpeed = 'medium';

  function optionsFor(game: RegisteredGame): Record<string, string> {
    let options = values.get(game);
    if (!options) {
      options = Object.fromEntries(game.options?.map(option => [option.id, option.defaultValue]) ?? []);
      values.set(game, options);
    }
    return options;
  }

  function render(game: RegisteredGame | undefined): void {
    container.replaceChildren();
    if (!game) return;
    const values = optionsFor(game);
    const options: readonly GameOption[] = game.speed === false ? game.options ?? [] : [...game.options ?? [], speedOption];
    const rows: { row: HTMLLabelElement; when: { id: string; value: string } }[] = [];
    const syncVisibility = () => {
      for (const { row, when } of rows) row.hidden = values[when.id] !== when.value;
    };
    for (const option of options) {
      const isSpeed = option === speedOption;
      const row = document.createElement('label');
      row.className = 'setting-row';
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = t(option.label);
      const detail = document.createElement('small');
      detail.textContent = t(option.kind === 'number' ? option.detail : 'Applies to the next run');
      copy.append(title, detail);
      const control = option.kind === 'select' ? document.createElement('select') : document.createElement('input');
      if (option.kind === 'select' && control instanceof HTMLSelectElement) {
        for (const { value, label } of option.choices) {
          control.add(new Option(typeof label === 'string' ? t(label) : label(), value));
        }
      } else if (option.kind === 'number' && control instanceof HTMLInputElement) {
        control.type = 'number';
        control.min = String(option.min);
        control.max = String(option.max);
        if (option.when) rows.push({ row, when: option.when });
      }
      control.setAttribute('aria-label', t(option.kind === 'number' ? option.ariaLabel ?? option.label : option.label));
      control.value = isSpeed ? speed : values[option.id];
      control.addEventListener('change', () => {
        if (option.kind === 'number') {
          control.value = String(Math.max(option.min, Math.min(option.max, Math.round(Number(control.value) || option.min))));
        }
        if (isSpeed) speed = control.value as GameSpeed;
        else values[option.id] = control.value;
        syncVisibility();
        onChange();
      });
      row.append(copy, control);
      container.append(row);
    }
    syncVisibility();
  }

  return { render, optionsFor, get speed() { return speed; } };
}
