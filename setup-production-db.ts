import { db } from './server/db';
import { items, adminUsers } from './shared/schema';
import { eq } from 'drizzle-orm';
import { PRODUCTION_DATA } from './embedded-data';

async function setupProductionDatabase() {
  try {
    console.log('🔄 Setting up production database...');
    
    // 1. Setup Admin User
    console.log('👤 Setting up admin user...');
    const adminUsername = 'admin';
    const adminPassword = 'Admin2025!';
    
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, adminUsername)
    });
    
    if (!existingAdmin) {
      await db.insert(adminUsers).values({
        username: adminUsername,
        password: adminPassword
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // 2. Check if items already exist
    const existingItemsCount = await db.query.items.findMany();
    
    if (existingItemsCount.length > 0) {
      console.log(`✅ Items already exist: ${existingItemsCount.length} items found`);
      console.log('🎉 Production database is already set up!');
      return;
    }
    
    // 3. Load items from embedded data
    console.log('📦 Loading items from embedded data...');
    
    const itemsToInsert = PRODUCTION_DATA.items.map(item => ({
      name: item.name,
      description: item.description,
      category: item.category as any,
      quality: item.quality as any,
      ambientacion: item.ambientacion as any,
      basePrice: item.basePrice,
      minMargin: item.minMargin,
      maxMargin: item.maxMargin,
      status: item.status
    }));
    
    console.log(`📝 Loaded ${itemsToInsert.length} items from production data`);
    
    // Insert items in batches
    console.log('💾 Inserting items into production database...');
    const batchSize = 50;
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize);
      await db.insert(items).values(batch);
      console.log(`✅ Inserted batch ${Math.ceil(i / batchSize) + 1}/${Math.ceil(itemsToInsert.length / batchSize)}`);
    }
    
    console.log('🎉 Production database setup completed successfully!');
    console.log(`📊 Total items imported: ${itemsToInsert.length}`);
    
    // Show summary
    const summary: Record<string, number> = {};
    itemsToInsert.forEach(item => {
      summary[item.category] = (summary[item.category] || 0) + 1;
    });
    
    console.log('\n📋 Items by category:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });
    
    console.log('\n🔑 Admin credentials:');
    console.log(`   Usuario: ${adminUsername}`);
    console.log(`   Contraseña: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProductionDatabase().catch(console.error);
}

export { setupProductionDatabase };