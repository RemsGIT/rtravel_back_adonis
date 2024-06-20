import vine from '@vinejs/vine'

export const contactFromCommercialSite = vine.compile(
  vine.object({
    name: vine.string(),
    email: vine.string().email(),
    body: vine.string(),
  })
)
