import React from 'react'
import Image from 'next/image'
import slackLogo from '../../assets/images/slack.png'

interface SlackIconProps {
  size?: number | string
  className?: string
}

export function SlackIcon({ className, size = 48 }: SlackIconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size
  return (
    <Image
      src={slackLogo}
      alt="Slack"
      width={sizeNum}
      height={sizeNum}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}
