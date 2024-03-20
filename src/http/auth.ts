import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'

import { env } from '../env'
import { Elysia, t, type Static } from 'elysia'
import { UnauthorizedError } from './erros/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
    }
  })
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .use(cookie())
  .derive(({ setCookie, jwt: { sign, verify }, removeCookie, cookie }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const jwt = await sign(payload)

        // a cool trick is to use a the application name in the local storage, also its cool to versonize the system to manage state changes
        setCookie('@pizzashop:auth-1.0.0', jwt, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      },
      signOutUser: () => {
        removeCookie('@pizzashop:auth-1.0.0')
      },
      getCurrentUser: async () => {
        const authCookie = cookie['@pizzashop:auth-1.0.0']

        const payload = await verify(authCookie)

        if (!payload) throw new UnauthorizedError()

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
  .derive(({ getCurrentUser }) => {
    return {
      getManagedRestaurantId: async () => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) throw new UnauthorizedError()

        return restaurantId
      },
    }
  })
