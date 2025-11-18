import React from 'react'
import Image from 'next/image'
import gmailLogo from '../../assets/images/Gmail_Logo_512px.png'

interface GmailIconProps {
  size?: number | string
  className?: string
}

export function GmailIcon({ size = 48, className }: GmailIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={gmailLogo}
      alt="Gmail"
      width={sizeNum}
      height={sizeNum}
      className={className}
    />
  )
}
