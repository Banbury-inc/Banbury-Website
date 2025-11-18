import React from 'react'
import Image from 'next/image'
import zoomLogo from '../../assets/images/zoom-fondo-blanco-vertical-seeklogo.png'

interface ZoomIconProps {
  size?: number | string
  className?: string
}

export function ZoomIcon({ className, size = 48 }: ZoomIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={zoomLogo}
      alt="Zoom"
      width={sizeNum}
      height={sizeNum}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
