ALTER TABLE "restaurants" ADD COLUMN "managerId" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_managerId_users_id_fk" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
