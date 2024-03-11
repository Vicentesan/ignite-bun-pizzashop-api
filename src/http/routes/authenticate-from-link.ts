import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  // Import the correct type for the fields parameter
  async ({ query, jwt: { sign }, setCookie, set }) => {
    const { code, redirect } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, operators) {
        return operators.eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) throw new Error('AuthLink not found.')

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7)
      throw new Error('AuthLink has expired, please generate a new one.')

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, operators) {
        return operators.eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    const jwt = await sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    // a cool trick is to use a the application name in the local storage, also its cool to versonize the system to manage state changes
    setCookie('@pizzashop:auth-1.0.0', jwt, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
