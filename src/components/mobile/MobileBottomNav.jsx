import { MobileNavIcon } from './MobileNavIcons'

const NAV_ITEMS_CREATE = [
  { id: 'home', labelKey: 'navHome' },
  { id: 'history', labelKey: 'navHistory' },
  { id: 'account', labelKey: 'navAccount' },
]

const NAV_ITEMS_CHART = [
  { id: 'chat', labelKey: 'navChat' },
  { id: 'charts', labelKey: 'navCharts' },
  { id: 'history', labelKey: 'navHistory' },
  { id: 'account', labelKey: 'navAccount' },
]

export default function MobileBottomNav({ chartCast, activeTab, onChange, t }) {
  const items = chartCast ? NAV_ITEMS_CHART : NAV_ITEMS_CREATE

  return (
    <nav className="mobile-bottom-nav" aria-label={t('mobileNavigation')}>
      {items.map((item) => {
        const active = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item${active ? ' active' : ''}`}
            onClick={() => onChange(item.id)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="mobile-nav-icon">
              <MobileNavIcon id={item.id} />
            </span>
            <span className="mobile-nav-label">{t(item.labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
