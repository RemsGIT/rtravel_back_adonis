// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { countryVisitedValidator } from '#validators/country_visited'
import CountryVisited from '#models/country_visited'

export default class CountriesVisitedController {
  async index({ response, auth }: HttpContext) {
    await auth.user?.load('countriesvisited')

    const countriesVisited = auth.user?.countriesvisited.map((c) => c.countryCode)

    return response.ok(countriesVisited)
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(countryVisitedValidator)

    const countryExists = await CountryVisited.query()
      .where('countryCode', payload.country_code)
      .andWhere('userId', auth.user?.id as number)

    if (countryExists.length > 0) return response.abort({ message: 'Already exist' })

    const countryVisited = await CountryVisited.create({
      countryCode: payload.country_code,
      userId: auth.user?.id,
    })

    return response.created(countryVisited)
  }

  async destroy({ params, response, auth }: HttpContext) {
    await CountryVisited.query()
      .where('countryCode', params.id)
      .andWhere('userId', auth.user?.id as number)
      .delete()

    return response.ok({ message: `deleted` })
  }
}
