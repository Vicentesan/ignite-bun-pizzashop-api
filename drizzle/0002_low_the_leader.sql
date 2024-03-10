ALTER TABLE "restaurants" DROP CONSTRAINT "restaurants_managerId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "restaurants" ALTER COLUMN "managerId" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_managerId_users_id_fk" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
