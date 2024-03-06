// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'

export default class AuthController {
  async login({ auth, response, request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      await auth.use('web').login(user)

      return response.ok({ message: 'User connected', user })
    } catch (e) {
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
    await auth.use('web').logout()

    return response.ok({ message: 'Déconnexion réussie' })
  }

  me({ auth }: HttpContext) {
    return auth.user?.serializeAttributes({ omit: ['password'] })
  }
}
