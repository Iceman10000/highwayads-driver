// app/constants/BrandColors.ts
export const Brand = {
  facebook:  '#1877F2',
  instagram: '#E4405F',   // solid pink‑red fallback
  twitter:   '#1DA1F2',
  linkedin:  '#0077B5',
  phone:     '#1f5b43',   // your dark‑green accent
} as const;

export type BrandKey = keyof typeof Brand;
