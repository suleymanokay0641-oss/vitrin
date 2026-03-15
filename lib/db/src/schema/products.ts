import { pgTable, text, serial, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  store: text("store").notNull(),
  storeUrl: text("store_url"),
  originalPrice: real("original_price").notNull(),
  lastOffersJson: text("last_offers_json"),
  officialPrice: real("official_price"),
  officialStoreUrl: text("official_store_url"),
  officialStoreName: text("official_store_name"),
  createdByUserId: integer("created_by_user_id"),
  affiliateClickCount: integer("affiliate_click_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pricesTable = pgTable("prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  price: real("price").notNull(),
  note: text("note"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  color: text("color").notNull(), // "green" | "yellow" | "red"
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  tag: text("tag"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const priceAlarmsTable = pgTable("price_alarms", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  email: text("email").notNull(),
  targetPrice: real("target_price").notNull(),
  token: text("token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameScoresTable = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull().default("Anonim"),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  guessedPrice: real("guessed_price").notNull(),
  actualPrice: real("actual_price").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessLeadsTable = pgTable("business_leads", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  productCount: text("product_count"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAccountsTable = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  phone: text("phone").unique(),
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  otpCode: text("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
  role: text("role").notNull().default("user"),
  totalPoints: integer("total_points").notNull().default(0),
  loyaltyMonths: integer("loyalty_months").notNull().default(0),
  isChampion: boolean("is_champion").notNull().default(false),
  championMultiplier: real("champion_multiplier").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pointEventsTable = pgTable("point_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  type: text("type").notNull(),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const raffleTicketsTable = pgTable("raffle_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  weekKey: text("week_key").notNull(),
  ticketCount: integer("ticket_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyPoolTable = pgTable("monthly_pool", {
  id: serial("id").primaryKey(),
  yearMonth: text("year_month").notNull().unique(),
  affiliateRevenue: real("affiliate_revenue").notNull().default(0),
  adRevenue: real("ad_revenue").notNull().default(0),
  subscriptionRevenue: real("subscription_revenue").notNull().default(0),
  totalRevenue: real("total_revenue").notNull().default(0),
  poolPercent: real("pool_percent").notNull().default(30),
  poolAmount: real("pool_amount").notNull().default(0),
  registrationRewardPool: real("registration_reward_pool").notNull().default(0),
  totalUniqueClicks: integer("total_unique_clicks").notNull().default(0),
  pricePerClick: real("price_per_click").notNull().default(0),
  status: text("status").notNull().default("active"),
  calculatedAt: timestamp("calculated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uniqueProductClicksTable = pgTable("unique_product_clicks", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  creatorUserId: integer("creator_user_id"),
  sessionId: text("session_id").notNull(),
  yearMonth: text("year_month").notNull(),
  clickDate: text("click_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMonthlyEarningsTable = pgTable("user_monthly_earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  yearMonth: text("year_month").notNull(),
  totalClicks: integer("total_clicks").notNull().default(0),
  earningsAmount: real("earnings_amount").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  yearMonth: text("year_month"),
  amount: real("amount").notNull(),
  method: text("method").notNull(),
  accountInfo: text("account_info").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("pending"),
  note: text("note"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id).unique(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("pending"),
  amount: real("amount").notNull().default(49),
  paymentMethod: text("payment_method"),
  accountInfo: text("account_info"),
  accountName: text("account_name"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
});

export const advertiserBalanceTable = pgTable("advertiser_balance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id).unique(),
  balance: real("balance").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  totalLoaded: real("total_loaded").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const balanceTopupTable = pgTable("balance_topup", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  amount: real("amount").notNull(),
  method: text("method").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const adCampaignsTable = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  advertiserId: integer("advertiser_id").notNull().references(() => userAccountsTable.id),
  name: text("name").notNull(),
  targetCategories: text("target_categories").array().notNull().default([]),
  targetKeywords: text("target_keywords").array().notNull().default([]),
  placement: text("placement").notNull().default("all"),
  budgetTotal: real("budget_total").notNull(),
  budgetRemaining: real("budget_remaining").notNull(),
  dailyBudget: real("daily_budget").notNull(),
  costPerClick: real("cost_per_click").notNull().default(2),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  destinationUrl: text("destination_url").notNull(),
  status: text("status").notNull().default("pending"),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalImpressions: integer("total_impressions").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adClicksTable = pgTable("ad_clicks", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => adCampaignsTable.id),
  sessionId: text("session_id").notNull(),
  clickDate: text("click_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---- Auth ----
export const refreshTokensTable = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---- Puan & Streak ----
export const userMonthlyPointsTable = pgTable("user_monthly_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  yearMonth: text("year_month").notNull(),
  clickPoints: integer("click_points").notNull().default(0),
  activityPoints: integer("activity_points").notNull().default(0),
  bonusPoints: integer("bonus_points").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  multiplier: real("multiplier").notNull().default(1),
  loyaltyBonus: real("loyalty_bonus").notNull().default(0),
  isChampion: boolean("is_champion").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStreakTable = pgTable("user_streak", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const championHistoryTable = pgTable("champion_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  yearMonth: text("year_month").notNull(),
  finalRank: integer("final_rank").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  earnings: real("earnings").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userDailyTasksTable = pgTable("user_daily_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  taskType: text("task_type").notNull(),
  yearMonthDay: text("year_month_day").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ---- Koleksiyonlar ----
export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => userAccountsTable.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collectionItemsTable = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collectionsTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  sortOrder: integer("sort_order").notNull().default(0),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// ---- Takipçi ----
export const userFollowsTable = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => userAccountsTable.id),
  followingId: integer("following_id").notNull().references(() => userAccountsTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---- Sayfa Sahipliği & Reklam Geliri ----
export const pageOwnerRevenueTable = pgTable("page_owner_revenue", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  ownerId: integer("owner_id").notNull().references(() => userAccountsTable.id),
  yearMonth: text("year_month").notNull(),
  pageViews: integer("page_views").notNull().default(0),
  estimatedRevenue: real("estimated_revenue").notNull().default(0),
  paidOut: boolean("paid_out").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---- Şikayet / İçerik Raporu ----
export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  reporterUserId: integer("reporter_user_id").references(() => userAccountsTable.id),
  targetType: text("target_type").notNull(), // "product" | "review" | "user" | "collection"
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(), // "spam" | "inappropriate" | "fake" | "copyright" | "other"
  description: text("description"),
  status: text("status").notNull().default("pending"), // "pending" | "resolved" | "dismissed"
  resolvedByUserId: integer("resolved_by_user_id").references(() => userAccountsTable.id),
  resolvedAt: timestamp("resolved_at"),
  actionTaken: text("action_taken"), // "removed" | "warned" | "banned" | "none"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export const insertPriceSchema = createInsertSchema(pricesTable).omit({ id: true, recordedAt: true });
export const insertVoteSchema = createInsertSchema(votesTable).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export const insertPriceAlarmSchema = createInsertSchema(priceAlarmsTable).omit({ id: true, createdAt: true, triggeredAt: true });
export const insertGameScoreSchema = createInsertSchema(gameScoresTable).omit({ id: true, createdAt: true });
export const insertBusinessLeadSchema = createInsertSchema(businessLeadsTable).omit({ id: true, createdAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type Price = typeof pricesTable.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votesTable.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
export type InsertPriceAlarm = z.infer<typeof insertPriceAlarmSchema>;
export type PriceAlarm = typeof priceAlarmsTable.$inferSelect;
