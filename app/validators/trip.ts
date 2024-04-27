import vine from '@vinejs/vine'

export const createTripValidator = vine.compile(
  vine.object({
    name: vine.string(),
    city: vine.string(),
    start: vine.any(),
    end: vine.any(),
    countryCode: vine.string(),
  })
)

export const updateTripValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    city: vine.string().optional(),
    start: vine.any().optional(),
    end: vine.any().optional(),
    countryCode: vine.string().optional(),
    //thumbnail: vine.string().optional(),
    //cover: vine.string().optional(),
  })
)
