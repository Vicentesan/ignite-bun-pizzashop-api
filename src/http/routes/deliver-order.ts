import { Elysia, t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const deliverOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/deliver',
  async ({ getManagedRestaurantId, params, set }) => {
    const { orderId } = params
    const restaurantId = await getManagedRestaurantId()

    const order = await db.query.orders.findFirst({
      where(fields, operators) {
        return operators.and(
          operators.eq(fields.id, orderId),
          operators.eq(fields.restaurantId, restaurantId),
        )
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
