import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { orderItems, restaurants, users } from '.'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'delivering',
  'delivered',
  'canceled',
])

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalInCents: integer('totalInCents').notNull(),

  customerId: text('customerId').references(() => users.id, {
    onDelete: 'set null',
  }),
  restaurantId: text('restaurantId')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const ordersRelations = relations(orders, ({ one, many }) => {
  return {
    customer: one(users, {
      fields: [orders.customerId],
      references: [users.id],
      relationName: 'order-customer',
    }),
    restaurant: one(restaurants, {
      fields: [orders.restaurantId],
      references: [restaurants.id],
      relationName: 'order-restaurant',
    }),
    orderItems: many(orderItems),
  }
})
