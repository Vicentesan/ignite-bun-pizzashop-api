import dayjs from 'dayjs'
import { Elysia } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getDayOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/day-orders-amount', async ({ getManagedRestaurantId }) => {
    const restaurantId = await getManagedRestaurantId()

    const today = dayjs()
    const yesterday = today.subtract(1, 'day')
    const startOfYesterday = yesterday.startOf('day')

    const orderPerDay = await db
      .select({
        dayWithMonthAndYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfYesterday.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)

    const todayWithMonthAndYear = today.format('YYYY-MM-DD')
    const yesterdayWithMonthAndYear = yesterday.format('YYYY-MM-DD')

    const todayOrdersAmount = orderPerDay.find((dayOrdersAmount) => {
      return dayOrdersAmount.dayWithMonthAndYear === todayWithMonthAndYear
    })
    const yesterdayOrdersAmount = orderPerDay.find((dayOrdersAmount) => {
      return dayOrdersAmount.dayWithMonthAndYear === yesterdayWithMonthAndYear
    })

    const diffFromYesterday =
      todayOrdersAmount && yesterdayOrdersAmount
        ? (todayOrdersAmount.amount - yesterdayOrdersAmount.amount) /
          yesterdayOrdersAmount.amount
        : 0

    return {
      amount: todayOrdersAmount ? todayOrdersAmount.amount : 0,
      diffFromYesterday: Number((diffFromYesterday * 100).toFixed(2)),
    }
  })
