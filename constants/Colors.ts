// constants/Colors.ts
const Colors = {
  /* App surface tones ----------------------------------------------------- */
  background: '#f4fdfb',
  card:        '#ffffff',

  /* Brand greens ---------------------------------------------------------- */
  primary:   '#2d6a4f',   // headings, hero title
  highlight: '#40916c',   // buttons, accents
  accent:    '#52b788',   // secondary accent / gradients

  /* Utility ----------------------------------------------------------------*/
  border:   '#d2e8dd',
  shadow:   '#000000',
  white:    '#ffffff',
  disabled: '#c8d9d2',

  /* Text -------------------------------------------------------------------*/
  text:        '#1f3a2d',
  textSubtle:  '#2d6a4f99',
  danger:      '#a2261e',

  /* NEW – banner / nav bar -------------------------------------------------*/
  banner:  '#0f3e46',   // the dark teal top strip
  brandBg: '#13525d',   // optional lighter companion
} as const;

export default Colors;
export type ColorKeys = keyof typeof Colors;
