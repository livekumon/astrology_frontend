const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function NavIconHome() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

export function NavIconChat() {
  return (
    <svg {...iconProps}>
      <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.3 8.38 8.38 0 0 1-3.9-.9L3 21l1.9-5.6a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 3.3-6.6 8.38 8.38 0 0 1 5.4-1.9H12a8.5 8.5 0 0 1 8 8.5Z" />
    </svg>
  )
}

export function NavIconCharts() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function NavIconHistory() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function NavIconAccount() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </svg>
  )
}

const ICON_MAP = {
  home: NavIconHome,
  chat: NavIconChat,
  charts: NavIconCharts,
  history: NavIconHistory,
  account: NavIconAccount,
}

export function MobileNavIcon({ id }) {
  const Icon = ICON_MAP[id]
  return Icon ? <Icon /> : null
}
