import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../db/schema'
import { env } from '../../env'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userFormEmail = await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, email)
      },
    })

    if (!userFormEmail) throw new Error('User not found')

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      code: authLinkCode,
      userId: userFormEmail.id,
    })

    // TODO: Send email with authLinkCode

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    console.log(authLink.toString())
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
