import { Elysia } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'

export const getManagedRestaurant = new Elysia().use(auth).get(
  '/managed-restaurant',
  async ({ getManagedRestaurantId }) => {
    const restaurantId = await getManagedRestaurantId()

    if (!restaurantId) throw new Error('User is not a restaurant manager.')

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, restaurantId)
      },
    })

    if (!managedRestaurant) throw new Error('Restaurant not found.')

    return managedRestaurant
  },
  {},
)
