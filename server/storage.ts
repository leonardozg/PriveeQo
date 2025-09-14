import { 
  type User, type UpsertUser, type Item, type InsertItem, type Quote, type InsertQuote, 
  type QuoteItem, type InsertQuoteItem, type QuoteWithItems,
  type AdminUser, type InsertAdminUser, type Partner, type InsertPartner,
  users, items, quotes, quoteItems, adminUsers, partners
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual, randomUUID } from "crypto";
import { promisify } from "util";

export interface IStorage {
  // Users (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  authenticateAdmin(username: string, password: string): Promise<AdminUser | null>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  updateAdminPassword(username: string, newPassword: string): Promise<boolean>;

  // Partners
  getPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  getPartnerByEmail(email: string): Promise<Partner | undefined>;
  getPartnerByUsername(username: string): Promise<Partner | undefined>;
  authenticatePartner(username: string, password: string): Promise<Partner | null>;
  changePartnerPassword(username: string, currentPassword: string, newPassword: string): Promise<boolean>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<QuoteWithItems | undefined>;
  createQuote(quote: InsertQuote, items: InsertQuoteItem[]): Promise<QuoteWithItems>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;
}

const scryptAsync = promisify(scrypt);

export class DatabaseStorage implements IStorage {
  constructor() {
    // No automatic seeding - handled by server startup
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${derivedKey.toString('hex')}.${salt}`;
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [key, salt] = hashedPassword.split('.');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      id: userData.id || randomUUID(),
    }).onConflictDoUpdate({
      target: users.id,
      set: userData
    }).returning();
    
    return user;
  }

  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return adminUser;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return adminUser;
  }

  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    const adminUser = await this.getAdminUserByUsername(username);
    if (!adminUser) return null;

    const isValid = await this.verifyPassword(password, adminUser.password);
    return isValid ? adminUser : null;
  }

  async createAdminUser(insertAdminUser: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await this.hashPassword(insertAdminUser.password);
    const [adminUser] = await db.insert(adminUsers).values({
      ...insertAdminUser,
      password: hashedPassword,
    }).returning();
    
    return adminUser;
  }

  async updateAdminPassword(username: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(newPassword);
    const result = await db.update(adminUsers)
      .set({ password: hashedPassword })
      .where(eq(adminUsers.username, username));
    return (result.rowCount ?? 0) > 0;
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async getPartnerByEmail(email: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.email, email));
    return partner;
  }

  async getPartnerByUsername(username: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.username, username));
    return partner;
  }

  async authenticatePartner(username: string, password: string): Promise<Partner | null> {
    const partner = await this.getPartnerByUsername(username);
    if (!partner) return null;

    const isValid = await this.verifyPassword(password, partner.password);
    return isValid ? partner : null;
  }

  async changePartnerPassword(username: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const partner = await this.getPartnerByUsername(username);
    if (!partner) return false;

    const isCurrentValid = await this.verifyPassword(currentPassword, partner.password);
    if (!isCurrentValid) return false;

    const hashedPassword = await this.hashPassword(newPassword);
    const result = await db.update(partners)
      .set({ password: hashedPassword })
      .where(eq(partners.username, username));

    return (result.rowCount ?? 0) > 0;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const hashedPassword = await this.hashPassword(partner.password);
    const [newPartner] = await db.insert(partners).values({
      ...partner,
      password: hashedPassword,
    }).returning();
    
    return newPartner;
  }

  async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const updateData = { ...partner };
    if (partner.password) {
      updateData.password = await this.hashPassword(partner.password);
    }

    const [updatedPartner] = await db.update(partners)
      .set(updateData)
      .where(eq(partners.id, id))
      .returning();
    
    return updatedPartner;
  }

  async deletePartner(id: string): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined> {
    const [updatedItem] = await db.update(items)
      .set(item)
      .where(eq(items.id, id))
      .returning();
    
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<QuoteWithItems | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return undefined;

    const quoteItemsList = await db.select({
      id: quoteItems.id,
      name: items.name,
      description: items.description,
      basePrice: items.basePrice,
      quoteId: quoteItems.quoteId,
      itemId: quoteItems.itemId,
      margin: quoteItems.margin,
      marginAmount: quoteItems.marginAmount,
      totalPrice: quoteItems.totalPrice,
    })
    .from(quoteItems)
    .leftJoin(items, eq(quoteItems.itemId, items.id))
    .where(eq(quoteItems.quoteId, id));

    const validItems = quoteItemsList.filter((item: any): item is typeof item & { 
      name: string; 
      description: string; 
      basePrice: string; 
    } => 
      item.name !== null && item.description !== null && item.basePrice !== null
    );
    
    return {
      ...quote,
      items: validItems
    };
  }

  private generateQuoteCode(partnerName: string, clientName: string): string {
    // Get partner initials
    const partnerInitials = partnerName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Get client initials  
    const clientInitials = clientName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // Generate folio
    const folio = Date.now().toString().slice(-4);
    
    return `${partnerInitials}-${clientInitials}-${folio}`;
  }

  async createQuote(quote: InsertQuote, quoteItemsList: InsertQuoteItem[]): Promise<QuoteWithItems> {
    // Generate quote number
    const quoteNumber = this.generateQuoteCode(quote.partnerName, quote.clientName);
    
    const [newQuote] = await db.insert(quotes).values({
      ...quote,
      quoteNumber
    }).returning();
    
    const quoteItemsWithQuoteId = quoteItemsList.map(item => ({
      ...item,
      quoteId: newQuote.id
    }));
    
    await db.insert(quoteItems).values(quoteItemsWithQuoteId);
    
    const createdQuote = await this.getQuote(newQuote.id);
    if (!createdQuote) throw new Error("Failed to create quote");
    
    return createdQuote;
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db.update(quotes)
      .set(quote)
      .where(eq(quotes.id, id))
      .returning();
    
    return updatedQuote;
  }

  async deleteQuote(id: string): Promise<boolean> {
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return (result.rowCount ?? 0) > 0;
  }


}

export const storage = new DatabaseStorage();