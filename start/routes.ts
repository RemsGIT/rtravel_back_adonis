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
  })
  .middleware(middleware.auth())
