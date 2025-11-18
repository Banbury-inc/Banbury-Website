import React from 'react'
import Image from 'next/image'
import googleDocsLogo from '../../assets/images/Google_Docs_Logo_512px.png'

interface GoogleDocsIconProps {
  size?: number | string
  className?: string
}

export function GoogleDocsIcon({ size = 48, className }: GoogleDocsIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={googleDocsLogo}
      alt="Google Docs"
      width={sizeNum}
      height={sizeNum}
      className={className}
    />
  )
}
