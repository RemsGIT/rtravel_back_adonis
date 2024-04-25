// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { checkOTPValidator, loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

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
        verified: user.isVerified,
      })
    } catch (e) {
      return response.abort({ error: 'invalid_credentials' })
    }
  }

  async register({ response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      const user = await User.create(payload)

      return response.created(user.serializeAttributes({ omit: ['password'] }))
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

  async generateOTPCode({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.isVerified) return response.abort({ error: 'ACCOUNT_ALREADY_VERIFIED' })

    // 4 digits
    const otp = Math.floor(1000 + Math.random() * 9000)

    await user
      .merge({
        otpCode: otp,
        otpExpireAt: DateTime.now().plus({ minutes: 5 }),
      })
      .save()

    // Send otp code by mail
    await mail.send((message) => {
      message
        .to(user.email)
        .subject('Activation du compte')
        .html(`<p>Voici ton code : ${otp}. Il est valide 5 minutes</p>`)
    })
  }

  async checkOTPCode({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(checkOTPValidator)

    const user = auth.getUserOrFail()
    if (user.isVerified) return response.abort({ error: 'ACCOUNT_ALREADY_VERIFIED' })

    if (!user.otpCode || !user.otpExpireAt) return response.abort({ error: 'NO_OTP' })

    // Check if code is valid
    if (Number(user.otpCode) !== payload.otp) return response.abort({ error: 'OTP_NOT_VALID' })

    // Check if date is expired
    if (user.otpExpireAt && user.otpExpireAt <= DateTime.now()) {
      return response.abort({ error: 'OTP_EXPIRED' })
    }

    await user
      .merge({
        isVerified: true,
      })
      .save()

    return response.ok({ message: 'ACCOUNT_VERIFIED' })
  }

  me({ auth, response }: HttpContext) {
    try {
      const user = auth
        .getUserOrFail()
        .serializeAttributes({ omit: ['password', 'otpCode', 'otpExpireAt'] })

      if (!user.isVerified) {
        return response.abort({ error: 'ACCOUNT_NOT_VERIFIED' })
      }

      return response.ok(user)
    } catch (error) {
      if (error.body.error === 'ACCOUNT_NOT_VERIFIED')
        return response.abort({ error: 'ACCOUNT_NOT_VERIFIED' })

      return response.unauthorized({ error: 'User not found' })
    }
  }

  async logout({ auth, response }: HttpContext) {
    const user = await auth.authenticate()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({ message: 'Déconnexion réussie' })
  }
}
