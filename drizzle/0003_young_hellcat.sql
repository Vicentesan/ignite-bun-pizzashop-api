CREATE TABLE IF NOT EXISTS "auth_links" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "auth_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_links" ADD CONSTRAINT "auth_links_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
