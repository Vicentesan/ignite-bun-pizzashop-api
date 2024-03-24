import { Elysia } from 'elysia'
import { auth } from '../auth'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getMonthCanceledOrdersAmount = new Elysia()
  .use(auth)
  .get(
    '/metrics/month-canceled-orders-amount',
    async ({ getManagedRestaurantId }) => {
      const restaurantId = await getManagedRestaurantId()

      const today = dayjs()
      const lastMonth = today.subtract(1, 'month')
      const startOfLastMonth = lastMonth.startOf('month')

      const ordersPerMonth = await db
        .select({
          monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
          amount: count(),
        })
        .from(orders)
        .where(
          and(
            eq(orders.restaurantId, restaurantId),
            eq(orders.status, 'canceled'),
            gte(orders.createdAt, startOfLastMonth.toDate()),
          ),
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

      const currentMonthWithYear = today.format('YYYY-MM')
      const lastMonthWithYear = lastMonth.format('YYYY-MM')

      const currentMonthOrdersAmount = ordersPerMonth.find((orderPerMonth) => {
        return orderPerMonth.monthWithYear === currentMonthWithYear
      })
      const lastMonthOrdersAmount = ordersPerMonth.find((orderPerMonth) => {
        return orderPerMonth.monthWithYear === lastMonthWithYear
      })

      const diffFromLastMonth =
        currentMonthOrdersAmount && lastMonthOrdersAmount
          ? (currentMonthOrdersAmount.amount - lastMonthOrdersAmount.amount) /
            lastMonthOrdersAmount.amount
          : 0

      return {
        amount: currentMonthOrdersAmount ? currentMonthOrdersAmount.amount : 0,
        diffFromLastMonth: Number((diffFromLastMonth * 100).toFixed(2)),
      }
    },
  )
