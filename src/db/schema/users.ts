import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { orders, restaurants } from '.'

export const userRoleEnum = pgEnum('user_role', ['manager', 'customer'])

export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  role: userRoleEnum('role').default('customer'),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ one, many }) => {
  return {
    managedRestaurant: one(restaurants, {
      fields: [users.id],
      references: [restaurants.managerId],
      relationName: 'managed-restaurant',
    }),
    orders: many(orders),
  }
})
