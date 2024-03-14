import { Elysia, t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../erros/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const deliverOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/deliver',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const order = await db.query.orders.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, orderId)
      },
    })

    if (!order) {
      set.status = 400

      return { message: 'Order not found.' }
    }

    if (order.status !== 'delivering') {
      set.status = 400

      return { message: 'You can only deliver delivering orders.' }
    }

    await db
      .update(orders)
      .set({ status: 'delivered' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
