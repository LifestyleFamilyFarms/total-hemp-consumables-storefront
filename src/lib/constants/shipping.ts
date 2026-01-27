export const ALLOWED_SHIPPING_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export const ALLOWED_SHIPPING_STATES_LABEL = ALLOWED_SHIPPING_STATES.join(" • ")

const parseEnvAllowlist = (value?: string) => {
  if (!value) {
    return null
  }

  if (value.trim() === "*") {
    return []
  }

  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.toLowerCase())

  return entries.length ? entries : null
}

const ENV_ALLOWLIST = parseEnvAllowlist(
  process.env.NEXT_PUBLIC_SHIPSTATION_SERVICE_ALLOWLIST
)

export const SHIPSTATION_SERVICE_ALLOWLIST =
  ENV_ALLOWLIST === null ? null : ENV_ALLOWLIST

const expandedAllowlistValues = SHIPSTATION_SERVICE_ALLOWLIST
  ? SHIPSTATION_SERVICE_ALLOWLIST.flatMap((entry) => {
      const normalized = entry.toLowerCase()

      if (!normalized.startsWith("shipstation_")) {
        return [normalized]
      }

      const withoutPrefix = normalized.replace(/^shipstation_/, "")

      return withoutPrefix ? [normalized, withoutPrefix] : [normalized]
    })
  : []

export const SHIPSTATION_SERVICE_ALLOWLIST_SET =
  expandedAllowlistValues.length > 0
    ? new Set(expandedAllowlistValues)
    : null
