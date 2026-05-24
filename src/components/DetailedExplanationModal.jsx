import { useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

function renderInline(text) {
  const parts = String(text).split(/(<em>.*?<\/em>)/g)
  return parts.map((part, i) => {
    const match = part.match(/^<em>(.*?)<\/em>$/)
    if (match) {
      return <em key={i}>{match[1]}</em>
    }
    return part
  })
}

function Section({ title, items, className = '' }) {
  if (!items?.length) return null

  return (
    <section className={`detail-modal-section ${className}`.trim()}>
      <h3 className="detail-modal-section-title">{title}</h3>
      <ul className="detail-modal-list">
        {items.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    </section>
  )
}

export default function DetailedExplanationModal({ open, onClose, question, detailedExplanation }) {
  const { copy } = useLanguage()

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !detailedExplanation) return null

  const sections = [
    { key: 'chartReasoning', title: copy.detailSections.chartReasoning, items: detailedExplanation.chartReasoning, className: 'detail-modal-section-primary' },
    { key: 'technicalTerms', title: copy.detailSections.technicalTerms, items: detailedExplanation.technicalTerms, className: 'detail-modal-section-terms' },
    { key: 'highlights', title: copy.detailSections.highlights, items: detailedExplanation.highlights },
    { key: 'suggestions', title: copy.detailSections.suggestions, items: detailedExplanation.suggestions },
    { key: 'pitfalls', title: copy.detailSections.pitfalls, items: detailedExplanation.pitfalls },
    { key: 'relatedInfo', title: copy.detailSections.relatedInfo, items: detailedExplanation.relatedInfo },
  ].filter((section) => section.items?.length)

  return (
    <div className="detail-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="detail-modal-header">
          <div>
            <div className="detail-modal-eyebrow">✦ {copy.detailModalEyebrow}</div>
            <h2 id="detail-modal-title" className="detail-modal-title">
              {copy.detailModalTitle}
            </h2>
            {copy.detailModalSubtitle && (
              <p className="detail-modal-subtitle">{copy.detailModalSubtitle}</p>
            )}
            {question && <p className="detail-modal-question">"{question}"</p>}
          </div>
          <button type="button" className="detail-modal-close" onClick={onClose} aria-label={copy.detailModalClose}>
            ×
          </button>
        </div>

        <div className="detail-modal-body">
          {sections.length ? (
            sections.map((section) => (
              <Section
                key={section.key}
                title={section.title}
                items={section.items}
                className={section.className}
              />
            ))
          ) : (
            <p className="detail-modal-empty">{copy.detailModalEmpty}</p>
          )}
        </div>

        <div className="detail-modal-footer">
          <button type="button" className="detail-modal-dismiss" onClick={onClose}>
            {copy.detailModalClose}
          </button>
        </div>
      </div>
    </div>
  )
}
