import { createId } from "@paralleldrive/cuid2";
import { text, timestamp, pgTable, pgEnum  } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["manager", "customer"]);

export const user = pgTable("users", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").unique(),
  role: userRoleEnum('role').default('customer'),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});