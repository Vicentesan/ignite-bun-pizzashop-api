import { and, eq } from 'drizzle-orm'
import { db } from './connection'
import { orderItems, orders, products, restaurants, users } from './schema'
import chalk from 'chalk'
import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'

function seedYourDatabaseError() {
  throw new Error('To make day orders, you first need to seed the database.')
}

/**
 * Find customers
 */

const [customer1, customer2] = await db
  .select()
  .from(users)
  .where(eq(users.role, 'customer'))

if ((!customer1 && !customer2) || !customer1 || !customer2)
  seedYourDatabaseError()

console.log(chalk.yellow('At least 2 customers were found.'))

/**
 * Find the manager by the email
 */

const [manager] = await db
  .select()
  .from(users)
  .where(
    and(eq(users.role, 'manager'), eq(users.email, 'vikom.sanchez@gmail.com')),
  )

if (!manager) seedYourDatabaseError()

console.log(chalk.yellow('A manager was successfully found.'))

/**
 * Find the restaurant managed by the manager
 */

const [managedRestaurant] = await db
  .select()
  .from(restaurants)
  .where(eq(restaurants.managerId, manager.id))

if (!managedRestaurant) seedYourDatabaseError()

console.log(chalk.yellow('The managers restaurant was found.'))

/**
 * Create products
 */

function generateProducts() {
  return {
    restaurantId: managedRestaurant.id,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
  }
}

const availableProducts = await db
  .insert(products)
  .values([
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
    generateProducts(),
  ])
  .returning()

console.log(chalk.yellow('6 Products were created successfully.'))

/**
 * Create orders
 */

type OrderItemInset = typeof orderItems.$inferInsert
type OrderInsert = typeof orders.$inferInsert

const orderItemsToInsert: OrderItemInset[] = []
const ordersToInsert: OrderInsert[] = []

for (let i = 0; i < 150; i++) {
  const orderId = createId()
  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 })

    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      priceInCents: orderProduct.priceInCents,
      quantity,
      productId: orderProduct.id,
    })
  })

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: managedRestaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 7 }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.yellow('150 Orders were created successfully.'))

console.log(chalk.greenBright('Database seeded successfully.'))

process.exit()
