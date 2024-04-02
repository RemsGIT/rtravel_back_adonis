// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'

export default class AuthController {
  async login({ response, request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        message: 'User connected',
        user: user.serialize(),
        token: token,
      })
    } catch (e) {
      console.log(e)
      return response.abort({ error: 'invalid_credentials' })
    }
  }

  async register({ response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      const user = await User.create(payload)

      return response.created(user)
    } catch (e) {
      switch (e.code) {
        case 'E_VALIDATION_ERROR':
          return response.badRequest({ errors: e.messages })
        default:
          return response.internalServerError({
            message: `Une erreur s'est produite lors de l'inscription.`,
          })
      }
    }
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({ message: 'Déconnexion réussie' })
  }

  me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail().serializeAttributes({ omit: ['password'] })
      return response.ok(user)
    } catch (error) {
      return response.unauthorized({ error: 'User not found' })
    }
  }
}
