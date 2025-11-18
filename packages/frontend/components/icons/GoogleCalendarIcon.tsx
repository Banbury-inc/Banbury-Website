import React from 'react'
import Image from 'next/image'
import googleCalendarLogo from '../../assets/images/7123030_google_calendar_icon.png'

interface GoogleCalendarIconProps {
  size?: number | string
  className?: string
}

export function GoogleCalendarIcon({ className, size = 200 }: GoogleCalendarIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={googleCalendarLogo}
      alt="Google Calendar"
      width={sizeNum}
      height={sizeNum}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
