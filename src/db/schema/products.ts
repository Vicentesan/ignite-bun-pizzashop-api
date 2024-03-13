import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { orderItems, restaurants } from '.'
import { relations } from 'drizzle-orm'

export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('priceInCents').notNull(),

  restaurantId: text('restaurantId')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),

  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const productsRelations = relations(products, ({ one, many }) => {
  return {
    restaurant: one(restaurants, {
      fields: [products.restaurantId],
      references: [restaurants.id],
      relationName: 'product-restaurant',
    }),
    orderItems: many(orderItems),
  }
})
