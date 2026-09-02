/**
 * Logo — Dynamic Dashboard brand component
 *
 * Usage:
 *   <Logo variant="full" />          — horizontal lockup (icon + wordmark)
 *   <Logo variant="icon" />          — D-mark icon only
 *   <Logo variant="full" theme="dark" />
 *   <Logo variant="icon" maxWidth={32} />
 *
 * Rules:
 * - Never distort; always preserve aspect ratio via width:auto or height:auto.
 * - No CSS filters to change logo colors.
 * - No extra shadows, borders, or animations on the logo itself.
 * - Use `theme` prop to select the correct asset; never apply filter: invert().
 */

import Image from 'next/image';

type LogoVariant = 'full' | 'icon';
type LogoTheme  = 'light' | 'dark' | 'auto';

type LogoProps = {
  variant?:  LogoVariant;
  theme?:    LogoTheme;
  /** Override height in px — width scales automatically via aspect ratio. */
  height?:   number;
  /** Override max-width in px. */
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Aspect ratios from viewBoxes: icon 160×160 = 1:1, full 520×140 = 3.71:1
const ASSET: Record<LogoVariant, Record<'light' | 'dark', { src: string; w: number; h: number }>> = {
  full: {
    light: { src: '/branding/logo-full.svg',      w: 520, h: 140 },
    dark:  { src: '/branding/logo-full-dark.svg', w: 520, h: 140 },
  },
  icon: {
    light: { src: '/branding/logo-icon.svg', w: 160, h: 160 },
    dark:  { src: '/branding/logo-icon.svg', w: 160, h: 160 },
  },
};

export function Logo({
  variant  = 'full',
  theme    = 'auto',
  height,
  maxWidth,
  className,
  style,
}: LogoProps) {
  // Resolve theme. 'auto' uses CSS to show/hide each variant.
  const resolvedTheme = theme === 'auto' ? 'light' : theme;
  const asset = ASSET[variant][resolvedTheme];

  const defaultHeight  = variant === 'icon' ? 36 : 44;
  const h = height ?? defaultHeight;
  // Compute width preserving aspect ratio
  const w = Math.round((asset.w / asset.h) * h);

  const imgStyle: React.CSSProperties = {
    width: 'auto',
    height: h,
    maxWidth: maxWidth ?? 'none',
    display: 'block',
    flexShrink: 0,
    ...style,
  };

  if (theme === 'auto' && variant === 'full') {
    // Render both; CSS controls visibility via data-theme on <html>
    return (
      <>
        <img
          src="/branding/logo-full.svg"
          alt="Dynamic Dashboard"
          style={{ ...imgStyle }}
          className={className}
          data-logo-theme="light"
          draggable={false}
        />
        <img
          src="/branding/logo-full-dark.svg"
          alt="Dynamic Dashboard"
          style={{ ...imgStyle, display: 'none' }}
          className={className}
          data-logo-theme="dark"
          draggable={false}
        />
      </>
    );
  }

  return (
    <img
      src={asset.src}
      alt="Dynamic Dashboard"
      width={w}
      height={h}
      style={imgStyle}
      className={className}
      draggable={false}
    />
  );
}
