import vine from '@vinejs/vine'

export const countryVisitedValidator = vine.compile(
  vine.object({
    country_code: vine.string(),
  })
)
