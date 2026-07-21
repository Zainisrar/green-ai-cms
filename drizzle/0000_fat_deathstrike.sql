CREATE TABLE "ecosystem_become_supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"what_you_need" jsonb NOT NULL,
	"why_green" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_client_partnerships" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"who_we_partner_with" jsonb NOT NULL,
	"our_client_partnership" jsonb NOT NULL,
	"what_sets_green_apart" jsonb NOT NULL,
	"use_cases" jsonb NOT NULL,
	"trusted_by" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_collaboration_innovation" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"our_philosophy" jsonb NOT NULL,
	"who_we_celebrate_with" jsonb NOT NULL,
	"innovation_spotlight" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_community_impact_loop" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"green_community_impact_loop" jsonb NOT NULL,
	"how_loop_works" jsonb NOT NULL,
	"measured_impact" jsonb NOT NULL,
	"join_the_loop" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_handbook" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"our_procurement_ethos" jsonb NOT NULL,
	"code_of_conduct" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_impact_measurement_esg" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"why_esg_matters_green" jsonb NOT NULL,
	"esg_integration_project_life_cycle" jsonb NOT NULL,
	"trust_signals" jsonb NOT NULL,
	"sample_metrics_snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_industry_affiliations_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"why_certification_affiliation_matter" jsonb NOT NULL,
	"our_current_certifications" jsonb NOT NULL,
	"industry_affiliations" jsonb NOT NULL,
	"what_this_means_clients" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_key_supply_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_our_procurement_philosophy" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"core_principles" jsonb NOT NULL,
	"what_we_wont_compromise" jsonb NOT NULL,
	"procurement_aligned_impact" jsonb NOT NULL,
	"strategic_vendor_relationships" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_our_value_chain" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_headline" text NOT NULL,
	"description" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"value_chain_strip" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_supply_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"global_sourcing_strategy" jsonb NOT NULL,
	"what_we_procure" jsonb NOT NULL,
	"how_become_green_supplier" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecosystem_technology_innovation_alliances" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"why_we_partner" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_careers_at_green" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"why_work_with_green_modal" jsonb NOT NULL,
	"career_track_support" jsonb NOT NULL,
	"what_makes_green_different" jsonb NOT NULL,
	"open_roles" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_community_voices" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_green_talent_incubator" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_join_us" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_headline" text NOT NULL,
	"description" text NOT NULL,
	"existing_users_cta_link" text NOT NULL,
	"new_users_cta_link" text NOT NULL,
	"quote" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"keys" jsonb NOT NULL,
	"data_policy_ethics" jsonb NOT NULL,
	"email" jsonb NOT NULL,
	"phone" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_team_green" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"who_we_are_modal" jsonb NOT NULL,
	"our_leadership_philosophy" jsonb NOT NULL,
	"meet_team" jsonb NOT NULL,
	"our_culture_action_modal" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empower_women_in_energy" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modal" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endeavors_flagship_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subheadline" text NOT NULL,
	"key" jsonb NOT NULL,
	"icons" jsonb NOT NULL,
	"description" text NOT NULL,
	"footer" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endeavors_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"featured_img" text DEFAULT '',
	"numberofsystems" text DEFAULT '',
	"noofdays" text DEFAULT '',
	"totalgeneration" text DEFAULT '',
	"battery" text DEFAULT '',
	"coal_a" text DEFAULT '',
	"emissionreduction" text DEFAULT '',
	"treesplanted" text DEFAULT '',
	"capacity" text DEFAULT '',
	"todateproduct" text DEFAULT '',
	"consumption" text DEFAULT '',
	"totalenergydaily" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "endeavors_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "energy" (
	"id" serial PRIMARY KEY NOT NULL,
	"service1" jsonb NOT NULL,
	"service2" jsonb NOT NULL,
	"service3" jsonb NOT NULL,
	"service4" jsonb NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text NOT NULL,
	"cta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_become_supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_book_consultation" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_headline" text NOT NULL,
	"description" jsonb NOT NULL,
	"consultation_focus_areas" jsonb NOT NULL,
	"booking_details" jsonb NOT NULL,
	"timings" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_investor_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"why_invest_green" jsonb NOT NULL,
	"investment_instruments" jsonb NOT NULL,
	"investment_focus_area" jsonb NOT NULL,
	"performance_snapshots" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_media_press" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"latest_press_releases" jsonb NOT NULL,
	"media_contact_requests" jsonb NOT NULL,
	"media_kit_download" jsonb NOT NULL,
	"green_news" jsonb NOT NULL,
	"official_spokes_people" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_newsletter_signup" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_headline" text NOT NULL,
	"description" jsonb NOT NULL,
	"why_subscribe" jsonb NOT NULL,
	"contact" text NOT NULL,
	"what_you_receive" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_partner_with_us" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modal" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_public_events_volunteering" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"modals" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engage_request_proposal" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sub_headline" text NOT NULL,
	"description" jsonb NOT NULL,
	"who_should_use_this" jsonb NOT NULL,
	"what_green_delivers_proposal" jsonb NOT NULL,
	"email" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"cta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineering_energy_storage_smart_grid" (
	"id" serial PRIMARY KEY NOT NULL,
	"header" jsonb NOT NULL,
	"architecture" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"statement" jsonb NOT NULL,
	"call_to_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineering_grid_intel" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"product_integration" jsonb NOT NULL,
	"technology_stack" jsonb NOT NULL,
	"scenarios" jsonb NOT NULL,
	"why_different" jsonb NOT NULL,
	"what_solves" jsonb NOT NULL,
	"challenge" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineering_hybrid_microgrid" (
	"id" serial PRIMARY KEY NOT NULL,
	"header" jsonb NOT NULL,
	"solutions" jsonb NOT NULL,
	"use_cases" jsonb NOT NULL,
	"statement" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"call_to_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineering_om_monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"header" jsonb NOT NULL,
	"philosophy" jsonb NOT NULL,
	"why_matters" jsonb NOT NULL,
	"services" jsonb NOT NULL,
	"call_to_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engineering_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"imgs" jsonb NOT NULL,
	"cta_button" jsonb NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "engineering_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "engineering_solar_epcm" (
	"id" serial PRIMARY KEY NOT NULL,
	"header" jsonb NOT NULL,
	"introduction" jsonb NOT NULL,
	"services" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"call_to_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enlighten_events_webinars" (
	"id" serial PRIMARY KEY NOT NULL,
	"upcoming_events" jsonb NOT NULL,
	"main_page" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enlighten_insights_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"featured_img" jsonb NOT NULL,
	"cta" jsonb DEFAULT '{"text":"","href":""}'::jsonb,
	"content" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enlighten_insights_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enlighten_media_mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_page" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enlighten_reports_whitepapers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text,
	"featured_img" jsonb,
	"year" text NOT NULL,
	"pptx" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enlighten_thought_leadership" (
	"id" serial PRIMARY KEY NOT NULL,
	"editorials" jsonb NOT NULL,
	"main_page" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evolution_certifications_accreditations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"esg_section" jsonb NOT NULL,
	"iso_section" jsonb NOT NULL,
	"clean_energy_section" jsonb NOT NULL,
	"certificate1" text DEFAULT '',
	"certificate2" text DEFAULT '',
	"certificate3" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evolution_leadership_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evolution_our_story_milestone" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"our_milestone" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evolution_our_story_milestone_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "evolution_sustainability_esg" (
	"id" serial PRIMARY KEY NOT NULL,
	"header" jsonb NOT NULL,
	"sections" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"tagline" text NOT NULL,
	"call_to_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evolution_vision_mission" (
	"id" serial PRIMARY KEY NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expertise" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"highlighted" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"slug" text NOT NULL,
	"highlighted_title" text NOT NULL,
	"subtitle_page" text NOT NULL,
	"description_page" text NOT NULL,
	"icons" jsonb NOT NULL,
	"carousel" jsonb NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explore_about_us" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"key" text NOT NULL,
	"content" jsonb NOT NULL,
	"quote" jsonb NOT NULL,
	"bg_img" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "explore_about_us_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "explore_fast_fact_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explore_global_snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"sections" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explore_why_green" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" jsonb NOT NULL,
	"content" jsonb NOT NULL,
	"icons" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home" (
	"id" serial PRIMARY KEY NOT NULL,
	"text1" jsonb NOT NULL,
	"text2" jsonb NOT NULL,
	"text3" jsonb NOT NULL,
	"text4" jsonb NOT NULL,
	"text5" jsonb NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insight_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"bg_img" text NOT NULL,
	"background_img" text,
	"nav" jsonb NOT NULL,
	"title" text NOT NULL,
	"sub" text NOT NULL,
	"desc" text NOT NULL,
	"name1" text NOT NULL,
	"name2" text NOT NULL,
	"card_title" text NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text NOT NULL,
	"highlighted" text NOT NULL,
	"description" text NOT NULL,
	"bg_img" text NOT NULL,
	"keys" jsonb NOT NULL,
	"cta1" jsonb NOT NULL,
	"cta2" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"top" boolean DEFAULT false,
	"accessor" text,
	"accesor" text,
	"image" jsonb,
	"text" jsonb,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"image" text,
	"role_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_parent_id_navigation_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;