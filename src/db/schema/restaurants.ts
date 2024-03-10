import { createId } from "@paralleldrive/cuid2";
import { text, timestamp, pgTable, pgEnum  } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";


export const restaurants = pgTable("restaurants", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: text('managerId').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const restaurantsRelations = relations(restaurants, ({ one }) => {
  return {
    manager: one(users, {
      fields: [restaurants.managerId],
      references: [users.id],
      relationName: 'restaurant-manager',
    }),
  }
})