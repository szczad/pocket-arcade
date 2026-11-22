import type { Bests } from './account';
import { gameNumber, games } from './games';
import { renderCover } from './games/cover-renderer';
import { t } from './i18n';

export function createPicker(root: HTMLElement) {
  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const count = String(games.length).padStart(2, '0');
  const tiles = games.map((game, index) => {
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = `#game/${game.id}`;
    link.innerHTML = `
      <article class="card ${game.color}">
        <div class="art">${renderCover(game.cover)}<span class="art-index">${gameNumber(index)} / ${count}</span></div>
        <div class="card-body">
          <div class="card-title"><h3></h3><span aria-hidden="true">✳</span></div>
          <p></p>
          <div class="card-bottom"><div><span class="micro"></span><strong class="best" data-best="${game.id}"></strong></div></div>
        </div>
      </article>`;
    return { game, link, title: link.querySelector('h3')!, description: link.querySelector('p')!,
      caption: link.querySelector('.micro')!, best: link.querySelector('.best')! };
  });
  $('.cards').append(...tiles.map(tile => tile.link));

  function localize(): void {
    $('.hero .eyebrow').lastChild!.textContent = t(' YOUR LITTLE CORNER OF PLAY');
    $('.intro').innerHTML = t('A little play goes a long way.<br>Pick a cartridge and beat your best.');
    const stamp = root.querySelectorAll('.hero-stamp span');
    stamp[0].textContent = t('INSERT');
    stamp[1].textContent = t('JUST KIDDING ✳');
    $('.hero-stamp strong').textContent = t('COIN');
    $('.section-heading .eyebrow').firstChild!.textContent = t('THE COLLECTION ');
    $('.section-heading .subtle').textContent = t('/ {arg0} GAMES', { arg0: count });
    $('.section-heading h2').textContent = t('Choose your game');
    $('.section-note').textContent = t('GOOD GAMES, NO QUARTERS.');
    const bottom = root.querySelectorAll('.bottom-line span');
    bottom[0].textContent = t('MADE FOR A LITTLE BREAK.');
    bottom[1].textContent = t('★  PLAY AT YOUR OWN PACE');
    for (const { game, link, title, description, caption } of tiles) {
      const name = t(game.name);
      link.setAttribute('aria-label', t('Play {arg0}', { arg0: name }));
      title.textContent = name;
      description.textContent = t(game.description);
      caption.textContent = t('PERSONAL BEST');
    }
  }

  function updateBests(bests: Bests): void {
    for (const { game, best } of tiles) {
      const score = bests[game.id];
      best.textContent = score === undefined ? t('Not played') : String(score);
    }
  }

  return { localize, updateBests };
}
