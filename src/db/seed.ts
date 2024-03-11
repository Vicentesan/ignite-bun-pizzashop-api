/* eslint-disable drizzle/enforce-delete-with-where */

import chalk from 'chalk'

import { faker } from '@faker-js/faker'

import { users, restaurants } from './schema'
import { db } from './connection'

await db.delete(users)
await db.delete(restaurants)

console.log(chalk.yellow('Database tables has been cleared.'))

/**
 * Create customers
 */

await db.insert(users).values([
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

console.log(chalk.yellow('2 customers were created successfully.'))

/**
 * Create manager
 */

const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
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

await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log(chalk.yellow('A restaurant was created successfully.'))

console.log(chalk.greenBright('Database seeded successfully.'))

process.exit()
