import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(64),
    email: vine
      .string()
      .email()
      .unique(async (db, field) => {
        const user = await db.from('users').where('email', field).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(32),
  })
)
