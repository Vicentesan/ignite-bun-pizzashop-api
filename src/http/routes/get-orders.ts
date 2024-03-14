import { Elysia, t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../erros/unauthorized-error'
import { orders, users } from '../../db/schema'
import { createSelectSchema } from 'drizzle-typebox'
import { and, count, eq, getTableColumns, ilike } from 'drizzle-orm'

const statusSchema = createSelectSchema(orders).properties.status
const orderTableColumns = getTableColumns(orders)

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { customerName, orderId, status, pageIndex } = query
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const baseQuery = db
      .select({
        ...orderTableColumns,
        customerName: users.name,
      })
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    const [[{ count: ordersCount }], allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10),
    ])

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: ordersCount,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(statusSchema),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
