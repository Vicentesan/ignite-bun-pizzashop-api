import { Elysia } from 'elysia'
import { auth } from '../auth'
import { sum, eq, desc } from 'drizzle-orm'
import { db } from '../../db/connection'
import { products, orderItems, orders } from '../../db/schema'

export const getPopularProducts = new Elysia()
  .use(auth)
  .get('/metrics/popular-products', async ({ getManagedRestaurantId }) => {
    const restaurantId = await getManagedRestaurantId()

    const popularProducts = await db
      .select({
        product: products.name,
        amount: sum(orderItems.quantity).mapWith(Number),
      })
      .from(orderItems)
      .leftJoin(orders, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy((fields) => desc(fields.amount))
      .limit(5)

    return popularProducts
  })
