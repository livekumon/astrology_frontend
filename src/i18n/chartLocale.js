const ABBR_TO_CODE = {
  Su: 'sun',
  Mo: 'moon',
  Ma: 'mars',
  Me: 'mercury',
  Ju: 'jupiter',
  Ve: 'venus',
  Sa: 'saturn',
  Ra: 'rahu',
  Ke: 'ketu',
}

const NAME_TO_CODE = {
  Sun: 'sun',
  Moon: 'moon',
  Mars: 'mars',
  Mercury: 'mercury',
  Jupiter: 'jupiter',
  Venus: 'venus',
  Saturn: 'saturn',
  Rahu: 'rahu',
  Ketu: 'ketu',
}

export function normalizePlanetCodes(planet) {
  if (planet.codes?.length) {
    return planet.codes
  }

  if (planet.label) {
    return planet.label
      .split(/[\s\n]+/)
      .map((part) => ABBR_TO_CODE[part] || part.toLowerCase())
      .filter(Boolean)
  }

  return []
}

export function normalizePlanetName(name) {
  if (!name) return name
  const lower = name.toLowerCase()
  if (NAME_TO_CODE[name]) return NAME_TO_CODE[name]
  return lower
}

export function formatPlanetCodes(codes, copy) {
  return codes
    .map((code) => copy.planetAbbr?.[code] ?? code)
    .join(' ')
}

export function getPlanetName(codeOrName, copy) {
  const code = normalizePlanetName(codeOrName)
  return copy.planetNames?.[code] ?? codeOrName
}

export function getWheelSignLabels(copy) {
  return copy.signWheel ?? copy.signWheelFallback ?? []
}

export function getWheelPlanetSymbols(copy) {
  const order = ['sun', 'moon', 'mars', 'venus', 'jupiter']
  return order.map((code) => ({
    code,
    label: copy.planetAbbr?.[code] ?? code,
  }))
}
