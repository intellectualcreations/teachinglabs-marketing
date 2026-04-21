/**
 * Avatar Manifest — maps all available superpower avatars.
 * Avatars are in /public/avatars/superpowers/
 */

export interface Avatar {
  id: string;
  path: string;
  intelligence: string;
  style: string;
  animal: string;
  label: string;
}

export const AVATAR_STYLES = [
  { id: 'cute', label: '🐾 Cute' },
  { id: 'edgy', label: '⚡ Edgy' },
  { id: 'ghibli', label: '✨ Ghibli' },
  { id: 'steampunk', label: '⚙️ Steampunk' },
  { id: 'popart', label: '🎨 Pop Art' },
  { id: 'minimal', label: '◻️ Minimal' },
  { id: 'cyberpunk', label: '🤖 Cyberpunk' },
  { id: 'space', label: '🚀 Space' },
  { id: 'graffiti', label: '🎱 Graffiti' },
];

const BASE = '/avatars/superpowers';

export const AVATARS: Avatar[] = [
  // ── Linguistic (Word Smart) ──
  { id: 'linguistic-anime-owl', path: `${BASE}/linguistic-anime-owl.jpg`, intelligence: 'linguistic', style: 'cute', animal: 'owl', label: 'Anime Owl' },
  { id: 'linguistic-flat-1', path: `${BASE}/linguistic-flat-1.jpg`, intelligence: 'linguistic', style: 'cute', animal: 'student', label: 'Flat Student' },
  { id: 'linguistic-cartoon-1', path: `${BASE}/linguistic-cartoon-1.jpg`, intelligence: 'linguistic', style: 'cute', animal: 'hero', label: 'Cartoon Hero' },
  { id: 'linguistic-wolf-edgy', path: `${BASE}/linguistic-wolf-edgy.jpg`, intelligence: 'linguistic', style: 'edgy', animal: 'wolf', label: 'Dark Wolf' },
  { id: 'linguistic-owl-ghibli', path: `${BASE}/linguistic-owl-watercolor.jpg`, intelligence: 'linguistic', style: 'ghibli', animal: 'owl', label: 'Watercolor Owl' },
  { id: 'linguistic-owl-steampunk', path: `${BASE}/linguistic-owl-steampunk.jpg`, intelligence: 'linguistic', style: 'steampunk', animal: 'owl', label: 'Steampunk Owl' },
  { id: 'linguistic-owl-popart', path: `${BASE}/linguistic-owl-popart.jpg`, intelligence: 'linguistic', style: 'popart', animal: 'owl', label: 'Pop Art Owl' },
  { id: 'linguistic-owl-minimal', path: `${BASE}/linguistic-owl-minimal.jpg`, intelligence: 'linguistic', style: 'minimal', animal: 'owl', label: 'Minimal Owl' },

  // ── Logical-Mathematical (Number Smart) ──
  { id: 'logical-fox', path: `${BASE}/logical-fox.jpg`, intelligence: 'logical_mathematical', style: 'cute', animal: 'fox', label: 'Smart Fox' },
  { id: 'logical-raven-edgy', path: `${BASE}/logical-raven-edgy.jpg`, intelligence: 'logical_mathematical', style: 'edgy', animal: 'raven', label: 'Dark Raven' },
  { id: 'logical-arcticfox-ghibli', path: `${BASE}/logical-arcticfox-ghibli.jpg`, intelligence: 'logical_mathematical', style: 'ghibli', animal: 'arctic fox', label: 'Arctic Fox' },
  { id: 'logical-raccoon-steampunk', path: `${BASE}/logical-raccoon-steampunk.jpg`, intelligence: 'logical_mathematical', style: 'steampunk', animal: 'raccoon', label: 'Steampunk Raccoon' },
  { id: 'logical-raccoon-popart', path: `${BASE}/logical-raccoon-popart.jpg`, intelligence: 'logical_mathematical', style: 'popart', animal: 'raccoon', label: 'Pop Art Raccoon' },
  { id: 'logical-fox-minimal', path: `${BASE}/logical-fox-minimal.jpg`, intelligence: 'logical_mathematical', style: 'minimal', animal: 'fox', label: 'Minimal Fox' },

  // ── Spatial (Picture Smart) ──
  { id: 'spatial-chameleon', path: `${BASE}/spatial-chameleon.jpg`, intelligence: 'spatial', style: 'cute', animal: 'chameleon', label: 'Chameleon' },
  { id: 'spatial-phoenix-edgy', path: `${BASE}/spatial-phoenix-edgy.jpg`, intelligence: 'spatial', style: 'edgy', animal: 'phoenix', label: 'Dark Phoenix' },
  { id: 'spatial-octopus-ghibli', path: `${BASE}/spatial-octopus-ghibli.jpg`, intelligence: 'spatial', style: 'ghibli', animal: 'octopus', label: 'Creative Octopus' },
  { id: 'spatial-chameleon-steampunk', path: `${BASE}/spatial-chameleon-steampunk.jpg`, intelligence: 'spatial', style: 'steampunk', animal: 'chameleon', label: 'Steampunk Chameleon' },
  { id: 'spatial-chameleon-popart', path: `${BASE}/spatial-chameleon-popart.jpg`, intelligence: 'spatial', style: 'popart', animal: 'chameleon', label: 'Pop Art Chameleon' },

  // ── Musical (Music Smart) ──
  { id: 'musical-songbird', path: `${BASE}/musical-songbird.jpg`, intelligence: 'musical', style: 'cute', animal: 'songbird', label: 'Songbird' },
  { id: 'musical-line-cat', path: `${BASE}/musical-line-cat.jpg`, intelligence: 'musical', style: 'cute', animal: 'cat', label: 'Music Cat' },
  { id: 'musical-snake-edgy', path: `${BASE}/musical-snake-edgy.jpg`, intelligence: 'musical', style: 'edgy', animal: 'snake', label: 'DJ Snake' },
  { id: 'musical-hummingbird-ghibli', path: `${BASE}/musical-hummingbird-ghibli.jpg`, intelligence: 'musical', style: 'ghibli', animal: 'hummingbird', label: 'Hummingbird' },
  { id: 'musical-bird-steampunk', path: `${BASE}/musical-bird-steampunk.jpg`, intelligence: 'musical', style: 'steampunk', animal: 'bird', label: 'Steampunk Bird' },
  { id: 'musical-bird-popart', path: `${BASE}/musical-bird-popart.jpg`, intelligence: 'musical', style: 'popart', animal: 'bird', label: 'Pop Art Bird' },
  { id: 'musical-bird-minimal', path: `${BASE}/musical-bird-minimal.jpg`, intelligence: 'musical', style: 'minimal', animal: 'bird', label: 'Minimal Bird' },

  // ── Bodily-Kinesthetic (Body Smart) ──
  { id: 'kinesthetic-cheetah', path: `${BASE}/kinesthetic-cheetah.jpg`, intelligence: 'bodily_kinesthetic', style: 'cute', animal: 'cheetah', label: 'Cheetah' },
  { id: 'kinesthetic-anime-fox', path: `${BASE}/kinesthetic-anime-fox.jpg`, intelligence: 'bodily_kinesthetic', style: 'cute', animal: 'fox', label: 'Adventure Fox' },
  { id: 'kinesthetic-panther-edgy', path: `${BASE}/kinesthetic-panther-edgy.jpg`, intelligence: 'bodily_kinesthetic', style: 'edgy', animal: 'panther', label: 'Electric Panther' },
  { id: 'kinesthetic-hawk-ghibli', path: `${BASE}/kinesthetic-hawk-ghibli.jpg`, intelligence: 'bodily_kinesthetic', style: 'ghibli', animal: 'hawk', label: 'Hawk' },
  { id: 'kinesthetic-cheetah-steampunk', path: `${BASE}/kinesthetic-cheetah-steampunk.jpg`, intelligence: 'bodily_kinesthetic', style: 'steampunk', animal: 'cheetah', label: 'Steampunk Cheetah' },

  // ── Interpersonal (People Smart) ──
  { id: 'interpersonal-dolphin', path: `${BASE}/interpersonal-dolphin.jpg`, intelligence: 'interpersonal', style: 'cute', animal: 'dolphin', label: 'Dolphin' },
  { id: 'interpersonal-dragon-edgy', path: `${BASE}/interpersonal-dragon-edgy.jpg`, intelligence: 'interpersonal', style: 'edgy', animal: 'dragon', label: 'Spirit Dragon' },
  { id: 'interpersonal-redpanda-ghibli', path: `${BASE}/interpersonal-redpanda-ghibli.jpg`, intelligence: 'interpersonal', style: 'ghibli', animal: 'red panda', label: 'Red Panda' },
  { id: 'interpersonal-dolphin-steampunk', path: `${BASE}/interpersonal-dolphin-steampunk.jpg`, intelligence: 'interpersonal', style: 'steampunk', animal: 'dolphin', label: 'Steampunk Dolphin' },
  { id: 'interpersonal-dolphin-popart', path: `${BASE}/interpersonal-dolphin-popart.jpg`, intelligence: 'interpersonal', style: 'popart', animal: 'dolphin', label: 'Pop Art Dolphin' },

  // ── Intrapersonal (Self Smart) ──
  { id: 'intrapersonal-leopard', path: `${BASE}/intrapersonal-leopard.jpg`, intelligence: 'intrapersonal', style: 'cute', animal: 'snow leopard', label: 'Snow Leopard' },
  { id: 'intrapersonal-tiger-edgy', path: `${BASE}/intrapersonal-tiger-edgy.jpg`, intelligence: 'intrapersonal', style: 'edgy', animal: 'tiger', label: 'Third Eye Tiger' },
  { id: 'intrapersonal-snowfox-ghibli', path: `${BASE}/intrapersonal-snowfox-ghibli.jpg`, intelligence: 'intrapersonal', style: 'ghibli', animal: 'snow fox', label: 'Snow Fox' },
  { id: 'intrapersonal-leopard-steampunk', path: `${BASE}/intrapersonal-leopard-steampunk.jpg`, intelligence: 'intrapersonal', style: 'steampunk', animal: 'snow leopard', label: 'Steampunk Leopard' },
  { id: 'intrapersonal-leopard-minimal', path: `${BASE}/intrapersonal-leopard-minimal.jpg`, intelligence: 'intrapersonal', style: 'minimal', animal: 'snow leopard', label: 'Minimal Leopard' },

  // ── Naturalistic (Nature Smart) ──
  { id: 'naturalistic-deer', path: `${BASE}/naturalistic-deer.jpg`, intelligence: 'naturalistic', style: 'cute', animal: 'deer', label: 'Deer' },
  { id: 'naturalistic-stag-edgy', path: `${BASE}/naturalistic-stag-edgy.jpg`, intelligence: 'naturalistic', style: 'edgy', animal: 'stag', label: 'Glowing Stag' },
  { id: 'naturalistic-bear-ghibli', path: `${BASE}/naturalistic-bear-ghibli.jpg`, intelligence: 'naturalistic', style: 'ghibli', animal: 'bear', label: 'Forest Bear' },
  { id: 'naturalistic-stag-steampunk', path: `${BASE}/naturalistic-stag-steampunk.jpg`, intelligence: 'naturalistic', style: 'steampunk', animal: 'stag', label: 'Steampunk Stag' },
  { id: 'naturalistic-deer-minimal', path: `${BASE}/naturalistic-deer-minimal.jpg`, intelligence: 'naturalistic', style: 'minimal', animal: 'deer', label: 'Minimal Deer' },

  // ── Cyberpunk Set ──
  { id: 'linguistic-wolf-cyberpunk', path: `${BASE}/linguistic-wolf-cyberpunk.jpg`, intelligence: 'linguistic', style: 'cyberpunk', animal: 'wolf', label: 'Cyber Wolf' },
  { id: 'logical-raven-cyberpunk', path: `${BASE}/logical_mathematical-raven-cyberpunk.jpg`, intelligence: 'logical_mathematical', style: 'cyberpunk', animal: 'raven', label: 'Cyber Raven' },
  { id: 'spatial-chameleon-cyberpunk', path: `${BASE}/spatial-chameleon-cyberpunk.jpg`, intelligence: 'spatial', style: 'cyberpunk', animal: 'chameleon', label: 'Cyber Chameleon' },
  { id: 'musical-cat-cyberpunk', path: `${BASE}/musical-cat-cyberpunk.jpg`, intelligence: 'musical', style: 'cyberpunk', animal: 'cat', label: 'Cyber Cat' },
  { id: 'kinesthetic-panther-cyberpunk', path: `${BASE}/bodily_kinesthetic-panther-cyberpunk.jpg`, intelligence: 'bodily_kinesthetic', style: 'cyberpunk', animal: 'panther', label: 'Cyber Panther' },
  { id: 'interpersonal-dolphin-cyberpunk', path: `${BASE}/interpersonal-dolphin-cyberpunk.jpg`, intelligence: 'interpersonal', style: 'cyberpunk', animal: 'dolphin', label: 'Cyber Dolphin' },
  { id: 'intrapersonal-leopard-cyberpunk', path: `${BASE}/intrapersonal-snow_leopard-cyberpunk.jpg`, intelligence: 'intrapersonal', style: 'cyberpunk', animal: 'snow leopard', label: 'Cyber Leopard' },
  { id: 'naturalistic-deer-cyberpunk', path: `${BASE}/naturalistic-deer-cyberpunk.jpg`, intelligence: 'naturalistic', style: 'cyberpunk', animal: 'deer', label: 'Cyber Deer' },

  // ── Space Explorer Set ──
  { id: 'linguistic-owl-space', path: `${BASE}/linguistic-owl-space.jpg`, intelligence: 'linguistic', style: 'space', animal: 'owl', label: 'Space Owl' },
  { id: 'logical-fox-space', path: `${BASE}/logical_mathematical-fox-space.jpg`, intelligence: 'logical_mathematical', style: 'space', animal: 'fox', label: 'Space Fox' },
  { id: 'spatial-octopus-space', path: `${BASE}/spatial-octopus-space.jpg`, intelligence: 'spatial', style: 'space', animal: 'octopus', label: 'Space Octopus' },
  { id: 'musical-hummingbird-space', path: `${BASE}/musical-hummingbird-space.jpg`, intelligence: 'musical', style: 'space', animal: 'hummingbird', label: 'Space Hummingbird' },
  { id: 'kinesthetic-hawk-space', path: `${BASE}/bodily_kinesthetic-hawk-space.jpg`, intelligence: 'bodily_kinesthetic', style: 'space', animal: 'hawk', label: 'Space Hawk' },
  { id: 'interpersonal-redpanda-space', path: `${BASE}/interpersonal-red_panda-space.jpg`, intelligence: 'interpersonal', style: 'space', animal: 'red panda', label: 'Space Red Panda' },
  { id: 'intrapersonal-snowfox-space', path: `${BASE}/intrapersonal-snow_fox-space.jpg`, intelligence: 'intrapersonal', style: 'space', animal: 'snow fox', label: 'Space Snow Fox' },
  { id: 'naturalistic-bear-space', path: `${BASE}/naturalistic-bear-space.jpg`, intelligence: 'naturalistic', style: 'space', animal: 'bear', label: 'Space Bear' },

  // ── Graffiti/Street Art Set ──
  { id: 'linguistic-wolf-graffiti', path: `${BASE}/linguistic-wolf-graffiti.jpg`, intelligence: 'linguistic', style: 'graffiti', animal: 'wolf', label: 'Graffiti Wolf' },
  { id: 'logical-raven-graffiti', path: `${BASE}/logical_mathematical-raven-graffiti.jpg`, intelligence: 'logical_mathematical', style: 'graffiti', animal: 'raven', label: 'Graffiti Raven' },
  { id: 'spatial-chameleon-graffiti', path: `${BASE}/spatial-chameleon-graffiti.jpg`, intelligence: 'spatial', style: 'graffiti', animal: 'chameleon', label: 'Graffiti Chameleon' },
  { id: 'musical-cat-graffiti', path: `${BASE}/musical-cat-graffiti.jpg`, intelligence: 'musical', style: 'graffiti', animal: 'cat', label: 'Graffiti Cat' },
  { id: 'kinesthetic-panther-graffiti', path: `${BASE}/bodily_kinesthetic-panther-graffiti.jpg`, intelligence: 'bodily_kinesthetic', style: 'graffiti', animal: 'panther', label: 'Graffiti Panther' },
  { id: 'interpersonal-dolphin-graffiti', path: `${BASE}/interpersonal-dolphin-graffiti.jpg`, intelligence: 'interpersonal', style: 'graffiti', animal: 'dolphin', label: 'Graffiti Dolphin' },
  { id: 'intrapersonal-leopard-graffiti', path: `${BASE}/intrapersonal-snow_leopard-graffiti.jpg`, intelligence: 'intrapersonal', style: 'graffiti', animal: 'snow leopard', label: 'Graffiti Leopard' },
  { id: 'naturalistic-deer-graffiti', path: `${BASE}/naturalistic-deer-graffiti.jpg`, intelligence: 'naturalistic', style: 'graffiti', animal: 'deer', label: 'Graffiti Deer' },
];

/** Get avatars filtered by intelligence and optionally style */
export function getAvatarsForIntelligence(intelligence: string, style?: string): Avatar[] {
  return AVATARS.filter(a =>
    a.intelligence === intelligence && (!style || a.style === style)
  );
}

/** Get all available avatars (no intelligence filter — students can pick any) */
export function getAllAvatars(style?: string): Avatar[] {
  return style ? AVATARS.filter(a => a.style === style) : AVATARS;
}
