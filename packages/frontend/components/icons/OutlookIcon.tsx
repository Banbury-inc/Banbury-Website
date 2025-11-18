import React from 'react'
import Image from 'next/image'
import outlookLogo from '../../assets/images/Microsoft_Office_Outlook_Logo_512px.png'

interface OutlookIconProps {
  size?: number | string
  className?: string
}

export function OutlookIcon({ size = 48, className }: OutlookIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={outlookLogo}
      alt="Microsoft Outlook"
      width={sizeNum}
      height={sizeNum}
      className={className}
    />
  )
}
