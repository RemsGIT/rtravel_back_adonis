/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const ParticipantsController = () => import('#controllers/participants_controller')
const TripsController = () => import('#controllers/trips_controller')
const ActivitiesController = () => import('#controllers/activities_controller')
const BudgetsController = () => import('#controllers/budgets_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Unauthenticated
router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/register', [AuthController, 'register'])
  })
  .prefix('auth')

// Authenticated
router
  .group(() => {
    router.get('/auth/me', [AuthController, 'me'])
    router.get('/auth/logout', [AuthController, 'logout'])

    router.resource('/trips', TripsController)
    router.resource('/activities', ActivitiesController).except(['index'])
    router.resource('/budgets', BudgetsController).except(['index'])
    router.resource('/payments', PaymentsController).except(['index'])
    router.resource('/participants', ParticipantsController).except(['index'])
  })
  .middleware(middleware.auth())
