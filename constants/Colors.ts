// constants/Colors.ts
const Colors = {
  background: '#f4fdfb',   // already had something similar
  card: '#ffffff',
  primary: '#2d6a4f',
  accent: '#52b788',       // if you didn’t already have this
  highlight: '#40916c',
  border: '#d2e8dd',
  shadow: '#000000',
  white: '#ffffff',
  disabled: '#c8d9d2',
  text: '#1f3a2d',         // base text (optional)
  textSubtle: '#2d6a4f99', // 60% opacity version of primary
  danger: '#a2261e',       // from earlier error styles
};

export default Colors;
export type ColorKeys = keyof typeof Colors;
