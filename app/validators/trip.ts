import vine from '@vinejs/vine'

export const createTripValidator = vine.compile(
  vine.object({
    name: vine.string(),
    city: vine.string(),
    start: vine.any(),
    end: vine.any()
  })
)

export const updateTripValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    city: vine.string().optional(),
    start: vine.any().optional(),
    end: vine.any().optional()
  })
)
