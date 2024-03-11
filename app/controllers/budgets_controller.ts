// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import { createBudgetValidator, updateBudgetValidator } from '#validators/budget'
import Trip from '#models/trip'
import Budget from '#models/budget'

export default class BudgetsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createBudgetValidator)

    const trip = await Trip.findOrFail(payload.tripId)

    try {
      const budget = await trip.related('budget').create({
        budget: payload.budget,
      })

      return response.created(budget)
    } catch (error) {
      console.log(error)
      return response.internalServerError()
    }
  }

  async show({ params, response }: HttpContext) {
    const budget = await Budget.findOrFail(params.id)

    return response.ok(budget)
  }

  async update({ params, request, response }: HttpContext) {
    const budget = await Budget.findOrFail(params.id)
    const payload = await request.validateUsing(updateBudgetValidator)

    const budgetUpdated = await budget.merge(payload).save()

    return response.ok(budgetUpdated)
  }

  async destroy({ params, response }: HttpContext) {
    const budget = await Budget.findOrFail(params.id)

    await budget.delete()

    return response.ok({ message: `Budget ${budget.id} deleted` })
  }
}
