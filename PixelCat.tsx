'use client';
// Next.js (App Router) wrapper for the <pixel-cat> web component.
// Put pixel-cat.js next to this file, then render <PixelCat /> once — e.g. in app/layout.tsx.

import { useEffect, type DetailedHTMLProps, type HTMLAttributes } from 'react';

/** Built-in cat colours. Leave unset for the default white cat. */
export type CatColor = 'default' | 'orange' | 'calico';
/** How often K jumps onto things by itself. 'sometimes' is the default. */
export type PerchRate = 'never' | 'rarely' | 'sometimes' | 'often';

type PixelCatAttrs = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  mode?: 'roam' | 'inline';
  scale?: number | string;
  'sleep-after'?: number | string;
  perch?: string;
  color?: CatColor;
  'perch-rate'?: PerchRate;
};

// Teach TypeScript/JSX that <pixel-cat> is a valid tag (React 19 namespace)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pixel-cat': PixelCatAttrs;
    }
  }
}

type Props = {
  mode?: 'roam' | 'inline';
  /** Pixel size multiplier: 3 → 132×138px on screen */
  scale?: number;
  /** Seconds of user inactivity before the cat naps */
  sleepAfter?: number;
  /** CSS selector of elements the cat may jump onto, or 'off'. Omit for the default set. */
  perch?: string;
  /** Cat colour: 'default' (white), 'orange' or 'calico'. Changing it switches the cat live. */
  color?: CatColor;
  /** How often K perches on its own: 'never', 'rarely', 'sometimes' (default) or 'often'. */
  perchRate?: PerchRate;
};

export default function PixelCat({ mode = 'roam', scale = 3, sleepAfter = 30, perch, color, perchRate }: Props) {
  useEffect(() => {
    // Dynamic import = runs only in the browser. The module touches `HTMLElement`
    // and `customElements`, which don't exist during server rendering.
    import('./pixel-cat.js');
  }, []);

  // Until the import resolves this is an empty unknown element — harmless, nothing flashes
  return <pixel-cat mode={mode} scale={scale} sleep-after={sleepAfter} perch={perch} color={color} perch-rate={perchRate} />;
}
