import { pgTable, uuid, text, timestamp, integer, real, boolean, jsonb, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("limitlens_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vercelConnections = pgTable("vercel_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  connectionName: varchar("connection_name", { length: 255 }).default("default"),
  encryptedVercelToken: text("encrypted_vercel_token").notNull(),
  teamId: varchar("team_id", { length: 255 }),
  accountType: varchar("account_type", { length: 50 }).default("hobby"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  lastValidatedAt: timestamp("last_validated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resourceLimits = pgTable("resource_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  planName: varchar("plan_name", { length: 100 }).notNull(),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  limitValue: real("limit_value").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  sourceNote: text("source_note"),
  lastVerifiedAt: timestamp("last_verified_at"),
}, (table) => ({
  planMetricUnique: uniqueIndex("plan_metric_unique").on(table.planName, table.metricKey),
}));

export const usageSnapshots = pgTable("usage_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  vercelConnectionId: uuid("vercel_connection_id").references(() => vercelConnections.id).notNull(),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  usedValue: real("used_value").notNull(),
  limitValue: real("limit_value").notNull(),
  percentageUsed: real("percentage_used").notNull(),
  remainingValue: real("remaining_value").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  rawPayload: jsonb("raw_payload"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  warningThreshold: real("warning_threshold").default(75).notNull(),
  dangerThreshold: real("danger_threshold").default(85).notNull(),
  criticalThreshold: real("critical_threshold").default(95).notNull(),
  cooldownMinutes: integer("cooldown_minutes").default(360).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
});

export const alertEvents = pgTable("alert_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  metricKey: varchar("metric_key", { length: 100 }).notNull(),
  thresholdLevel: varchar("threshold_level", { length: 50 }).notNull(),
  percentageUsed: real("percentage_used").notNull(),
  message: text("message"),
  channel: varchar("channel", { length: 50 }).default("email"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("sent").notNull(),
});

export const notificationChannels = pgTable("notification_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  channelType: varchar("channel_type", { length: 50 }).default("email").notNull(),
  emailTo: varchar("email_to", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monitorRuns = pgTable("monitor_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  status: varchar("status", { length: 50 }).default("running").notNull(),
  errorMessage: text("error_message"),
  usersChecked: integer("users_checked").default(0),
  alertsSent: integer("alerts_sent").default(0),
});
