/* eslint-disable drizzle/enforce-delete-with-where */

import chalk from 'chalk'

import { faker } from '@faker-js/faker'

import {
  users,
  restaurants,
  authLinks,
  products,
  orderItems,
  orders,
} from './schema'
import { db } from './connection'
import { createId } from '@paralleldrive/cuid2'

await db.delete(authLinks)
await db.delete(users)
await db.delete(restaurants)
await db.delete(products)
await db.delete(orders)
await db.delete(orderItems)

console.log(chalk.yellow('Database tables has been cleared.'))

/**
 * Create customers
 */

const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('2 customers were created successfully.'))

/**
 * Create manager
 */

const [manager] = await db
  .insert(users)
  .values([
    {
      name: 'Vicente Sanchez',
      email: 'vikom.sanchez@gmail.com',
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })

console.log(chalk.yellow('A manager was created successfully.'))

/**
 * Create restaurant
 */

const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: 'Pizza Shop',
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

console.log(chalk.yellow('A restaurant was created successfully.'))

/**
 * Create products
 */

function generateProducts() {
  return {
    restaurantId: restaurant.id,
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

for (let i = 0; i < 500; i++) {
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
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.yellow('500 Orders were created successfully.'))

console.log(chalk.greenBright('Database seeded successfully.'))

process.exit()
