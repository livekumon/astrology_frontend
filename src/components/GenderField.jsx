export default function GenderField({ value, onChange, t, idPrefix = '', compact = false }) {
  function select(next) {
    onChange(value === next ? '' : next)
  }

  return (
    <div className={`input-group gender-field${compact ? ' gender-field-compact' : ''}`}>
      <span className="input-label" id={`${idPrefix}gender-label`}>
        {t('genderOptional')}
      </span>
      <div className="gender-toggle" role="group" aria-labelledby={`${idPrefix}gender-label`}>
        <button
          type="button"
          className={`gender-btn${value === 'male' ? ' active' : ''}`}
          aria-pressed={value === 'male'}
          onClick={() => select('male')}
        >
          {t('genderMale')}
        </button>
        <button
          type="button"
          className={`gender-btn${value === 'female' ? ' active' : ''}`}
          aria-pressed={value === 'female'}
          onClick={() => select('female')}
        >
          {t('genderFemale')}
        </button>
      </div>
    </div>
  )
}
