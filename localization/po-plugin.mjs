import { readFileSync } from 'node:fs';
import gettext from 'gettext-parser';

// Edit en.po and pl.po directly. gettext-parser is a build-only dependency;
// Vite compiles the catalogs to static JS, so deployments need no gettext server.
// Keep msgctxt and {placeholder} names when editing translations.
export function poPlugin() {
  return {
    name: 'pocket-arcade-po',
    enforce: 'pre',
    transform(_source, id) {
      if (!id.endsWith('.po')) return;
      const catalog = gettext.po.parse(readFileSync(id));
      const messages = {};
      for (const [context, entries] of Object.entries(catalog.translations)) {
        for (const [id, entry] of Object.entries(entries)) {
          if (id && entry.msgstr?.[0] && !entry.comments?.flag?.includes('fuzzy')) {
            messages[context ? `${context}\u0004${id}` : id] = entry.msgstr[0];
          }
        }
      }
      return { code: `export default ${JSON.stringify(messages)};`, map: null };
    },
  };
}
