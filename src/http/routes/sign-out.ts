import { Elysia } from 'elysia'
import { auth } from '../auth'

export const signOut = new Elysia()
  .use(auth)
  .post('/sign-out', async ({ removeCookie }) => {
    removeCookie('@pizzashop:auth-1.0.0')
  })
