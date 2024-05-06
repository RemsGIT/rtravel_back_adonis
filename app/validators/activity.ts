import vine from '@vinejs/vine'

export const createActivityValidator = vine.compile(
  vine.object({
    name: vine.string(),
    place: vine.string().optional(),
    city: vine.string(),
    start: vine.any(),
    icon: vine.string().optional(),
    latitude: vine.number().optional().nullable(),
    longitude: vine.number().optional().nullable(),
  })
)

export const updateActivityValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    place: vine.string().optional(),
    city: vine.string().optional(),
    start: vine.any().optional(),
    icon: vine.string().optional(),
    latitude: vine.number().optional().nullable(),
    longitude: vine.number().optional().nullable(),
  })
)
