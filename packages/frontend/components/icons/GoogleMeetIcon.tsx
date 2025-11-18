import React from 'react'
import Image from 'next/image'
import googleMeetLogo from '../../assets/images/7089160_google_meet_icon.png'

interface GoogleMeetIconProps {
  size?: number | string
  className?: string
}

export function GoogleMeetIcon({ className, size = 48 }: GoogleMeetIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={googleMeetLogo}
      alt="Google Meet"
      width={sizeNum}
      height={sizeNum}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
