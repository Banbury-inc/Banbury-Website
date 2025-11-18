import React from 'react'
import Image from 'next/image'
import googleSheetsLogo from '../../assets/images/Google_Sheets_Logo_512px.png'

interface GoogleSheetsIconProps {
  size?: number | string
  className?: string
}

export function GoogleSheetsIcon({ size = 48, className }: GoogleSheetsIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={googleSheetsLogo}
      alt="Google Sheets"
      width={sizeNum}
      height={sizeNum}
      className={className}
    />
  )
}
