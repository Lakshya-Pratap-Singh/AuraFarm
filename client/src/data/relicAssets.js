// relicAssets.js
// Maps every relic catalog ID to its WebP artwork asset.
// Vite resolves these imports at build time — no runtime fetch needed.
// If a new relic is added without artwork, it falls back to the
// placeholder defined at the bottom of this file.

import emberImg         from "../assets/relics/ember-of-beginning.png";
import seedImg          from "../assets/relics/seed-of-discipline.png";
import scrollImg        from "../assets/relics/scroll-of-knowledge.png";
import ironStepImg      from "../assets/relics/iron-step.png";
import willpowerImg     from "../assets/relics/willpower-emblem.png";
import bladeImg         from "../assets/relics/discipline-blade.png";
import mindforgeImg     from "../assets/relics/midforge-sigil.png";
import ironCrestImg     from "../assets/relics/iron-resolve-crest.png";
import lanternImg       from "../assets/relics/aura-lantern.png";
import bookImg          from "../assets/relics/book-of-insight.png";
import shadowsEdgeImg   from "../assets/relics/shadows-edge.png";
import flameImg         from "../assets/relics/flame-of-persistence.png";
import pendantImg       from "../assets/relics/aura-pendant.png";
import crystalImg       from "../assets/relics/crystal vanguard.png";
import crownImg         from "../assets/relics/crown-of-discipline.png";
import obsidianImg      from "../assets/relics/obsidian-phoenix.png";
import ascensionImg     from "../assets/relics/relic-of-ascension.png";
import masteryImg       from "../assets/relics/eye-of-mastery.png";
import compassImg       from "../assets/relics/celestial-compass.png";
import firstFlameImg    from "../assets/relics/the-first-flame.png";

// Map: relic catalog id → imported image URL
// Key = the `id` field from RELIC_CATALOG in Relics.jsx
export const RELIC_ASSETS = {
  // COMMON
  "ember-of-beginning": emberImg,
  "seed-of-discipline": seedImg,
  "scroll-of-knowledge": scrollImg,
  "iron-step": ironStepImg,

  // RARE
  "willpower-emblem": willpowerImg,
  "discipline-blade": bladeImg,
  "mindforge-sigil": mindforgeImg,
  "iron-resolve-crest": ironCrestImg,
  "aura-lantern": lanternImg,

  // EPIC
  "book-of-insight": bookImg,
  "shadows-edge": shadowsEdgeImg,
  "flame-of-persistence": flameImg,
  "aura-pendant": pendantImg,
  "crystal-vanguard": crystalImg,

  // LEGENDARY
  "crown-of-discipline": crownImg,

  // MYTHIC
  "obsidian-phoenix": obsidianImg,
  "relic-of-ascension": ascensionImg,
  "eye-of-mastery": masteryImg,
  "celestial-compass": compassImg,
  "the-first-flame": firstFlameImg,
};

/**
 * getRelicImage(relicId)
 * Returns the image URL for the given relic id, or null if not found.
 * Components should handle null gracefully (hide img or show placeholder).
 *
 * @param {string} relicId  — relic catalog id, e.g. "crown-of-discipline"
 * @returns {string|null}   — resolved image URL or null
 */
export function getRelicImage(relicId) {
  return RELIC_ASSETS[relicId] ?? null;
}