import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { orders, products } from '.'

export const orderItems = pgTable('orderItems', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  priceInCents: integer('priceInCents').notNull(),
  quantity: integer('quantity').notNull(),

  orderId: text('orderId')
    .references(() => orders.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  productId: text('productId').references(() => products.id, {
    onDelete: 'set null',
  }),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => {
  return {
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
      relationName: 'order-item-order',
    }),
    product: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
      relationName: 'order-item-product',
    }),
  }
})
