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
import CountriesVisitedController from "#controllers/countries_visited_controller";
const UsersController = () => import('#controllers/users_controller')
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
    router.post('/logout', [AuthController, 'logout'])
  })
  .prefix('auth')

// Authenticated
router
  .group(() => {
    router.get('/auth/me', [AuthController, 'me'])
    router.get('/auth/logout', [AuthController, 'logout'])
    router.post('/auth/generate-otp', [AuthController, 'generateOTPCode'])
    router.post('/auth/check-otp', [AuthController, 'checkOTPCode'])

    /** region TRIPS **/
    router.get('/user/hastrips', [UsersController, 'hasTrips'])
    router.resource('trips', TripsController).except(['show', 'update']) // create trip, list trips of user...
    router
      .group(() => {
        router.get('/current', [TripsController, 'getCurrentOrMostRecentTrip'])
        router.get('/future', [TripsController, 'getFutureTrips'])
        router.get('/past', [TripsController, 'getPastTrips'])
      })
      .prefix('trips')


    router.get('trips/:tripId', [TripsController, 'show']).middleware(middleware.canViewTrip())
    router.patch('trips/:tripId', [TripsController, 'update']).middleware(middleware.canModifyTrip())
    router
      .group(() => {
        // NEED READ PERMISSION
        router
          .group(() => {
            router.get('/participants', [TripsController, 'getParticipants'])
            router.get('/budget', [TripsController, 'getBudget'])
            router.get('/payments', [TripsController, 'getPayments'])
          })
          .middleware(middleware.canViewTrip())

        // NEED MODIFY PERMISSION
        router
          .group(() => {
            router.resource('activities', ActivitiesController).except(['index'])
            router.resource('budget', BudgetsController).except(['index'])
            router.resource('payments', PaymentsController).except(['index'])
            router.resource('participants', ParticipantsController).except(['index'])
          })
          .middleware(middleware.canModifyTrip())
      })
      .prefix('trips/:tripId')
    /** endregion TRIPS **/

    /** region USERS **/
    router.patch('/user', [UsersController, 'update'])
    router
      .group(() => {
        router.get('/search/:email', [UsersController, 'searchByExactEmail'])
      })
      .prefix('users')
    router.resource('countries', CountriesVisitedController).only(['index', 'store', 'destroy'])
    /** endregion **/
  })
  .middleware(middleware.auth())
