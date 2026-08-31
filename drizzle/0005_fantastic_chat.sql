CREATE INDEX "gmail_oauth_states_user_id_idx" ON "gmail_oauth_states" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");