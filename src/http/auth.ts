import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'

import { env } from '../env'
import { Elysia, t, type Static } from 'elysia'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .use(cookie())
  .derive(({ setCookie, jwt: { sign }, removeCookie }) => {
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
    }
  })
