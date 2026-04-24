'use client';

import Image from 'next/image';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'footer';
  spin?: boolean;
  showRing?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'logo-3d-sm',
  md: 'logo-3d-md',
  lg: 'logo-3d-lg',
  xl: 'logo-3d-xl',
  footer: 'w-5 h-5',
};

export function Logo3D({ size = 'md', spin = true, showRing = true, className = '' }: Logo3DProps) {
  const img = (
    <img
      src="/logo-circular.png"
      alt="NeXFlowX"
      className={`logo-3d ${sizeMap[size]} ${spin ? 'logo-spin' : ''} ${className}`}
      draggable={false}
    />
  );

  if (size === 'footer') {
    return img;
  }

  if (showRing) {
    return <div className="logo-3d-wrapper">{img}</div>;
  }

  return img;
}
