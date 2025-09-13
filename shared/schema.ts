import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  company: text("company").notNull(),
  rfc: text("rfc").notNull(),
  email: text("email").notNull().unique(),
  whatsapp: text("whatsapp").notNull(),
  personalAddress: text("personal_address").notNull(),
  assistantName: text("assistant_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category", { 
    enum: ["Mobiliario", "Menú", "Decoración", "Branding", "Audio y Video", "Espectáculos", "Fotografía", "Memorabilia"] 
  }).notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  minMargin: integer("min_margin").notNull(), // percentage
  maxMargin: integer("max_margin").notNull(), // percentage
  status: text("status").notNull().default("active"), // active, inactive
  // New filtering criteria
  quality: text("quality", { enum: ["Plata", "Oro", "Platino"] }).notNull(),
  ambientacion: text("ambientacion", { enum: ["Conferencia", "Club", "Ceremonia", "Gala"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  partnerId: varchar("partner_id").references(() => partners.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientCompany: text("client_company"),
  projectName: text("project_name").notNull(),
  eventDate: text("event_date"), // Fecha tentativa del evento
  partnerName: text("partner_name").notNull(),
  partnerEmail: text("partner_email").notNull(),
  partnerCompany: text("partner_company").notNull(),
  subtotal: text("subtotal").notNull(),
  totalMargin: text("total_margin").notNull(),
  tax: text("tax").notNull().default("0"),
  total: text("total").notNull(),
  status: text("status", { 
    enum: ["draft", "sent", "accepted", "rejected", "executed", "expired"] 
  }).notNull().default("draft"), // draft -> sent -> accepted/rejected -> executed/expired
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quoteItems = pgTable("quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => items.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePrice: text("base_price").notNull(),
  margin: integer("margin").notNull(), // percentage
  marginAmount: text("margin_amount").notNull(),
  totalPrice: text("total_price").notNull(),
});

// Upsert user schema for Replit Auth
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  registrationDate: true,
});

export const partnerLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const partnerPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
  quoteId: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;

export type QuoteWithItems = Quote & {
  items: QuoteItem[];
};
