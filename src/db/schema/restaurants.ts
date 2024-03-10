import { createId } from "@paralleldrive/cuid2";
import { text, timestamp, pgTable, pgEnum  } from "drizzle-orm/pg-core";


export const restaurant = pgTable("restaurants", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});