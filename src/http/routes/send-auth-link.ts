import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
import { mailer } from '../../lib/mailer'

import nodemailer from 'nodemailer'

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

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    const info = await mailer.sendMail({
      from: {
        name: 'PizzaShop Inc.',
        address: 'hi@pizzashop.com',
      },
      to: email,
      subject: 'Authenticate your account to Pizza Shop',
      html: `<span>Use the following link to authenticate your account on Pizza Shop: <a href="${authLink.toString()}">Authenticate</a><span/>`,
      text: `Use the following link to authenticate your account on Pizza Shop: ${authLink.toString()}`,
    })

    console.log(nodemailer.getTestMessageUrl(info))
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
