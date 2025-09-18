import mongoose from 'mongoose';
import { UserBehavior } from '../models/recommendationModel.js';
import connectDB from '../config/db.js';

// Migration script to fix UserBehavior enum validation issues
const migrateUserBehaviorData = async () => {
  try {
    console.log('Starting UserBehavior data migration...');
    
    // Connect to database
    await connectDB();
    
    // Get all UserBehavior documents
    const userBehaviors = await UserBehavior.find({}).lean();
    console.log(`Found ${userBehaviors.length} UserBehavior documents to check`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const userBehavior of userBehaviors) {
      try {
        let needsUpdate = false;
        const updatedEvents = [];
        
        // Check each event for enum validation issues
        for (const event of userBehavior.events) {
          const originalType = event.type;
          let fixedType = originalType;
          
          // Map any problematic event types to valid ones
          const typeMapping = {
            'pageview': 'page_view',
            'page-view': 'page_view',
            'viewsection': 'view_section',
            'view-section': 'view_section',
            'productclick': 'product_click',
            'product-click': 'product_click',
            'addtocart': 'add_to_cart',
            'add-to-cart': 'add_to_cart',
            'addToCart': 'add_to_cart'
          };
          
          if (typeMapping[originalType]) {
            fixedType = typeMapping[originalType];
            needsUpdate = true;
            console.log(`Mapping event type: ${originalType} -> ${fixedType}`);
          }
          
          // Ensure the type is in the valid enum
          const validTypes = [
            "view", "click", "add_to_cart", "purchase", "like", "share", "search", "filter",
            "page_view", "view_section", "product_click", "favorite", "feedback"
          ];
          
          if (!validTypes.includes(fixedType)) {
            // Default to 'view' for any unknown types
            fixedType = 'view';
            needsUpdate = true;
            console.log(`Unknown event type ${originalType}, defaulting to 'view'`);
          }
          
          updatedEvents.push({
            ...event,
            type: fixedType
          });
        }
        
        if (needsUpdate) {
          // Update the document
          await UserBehavior.findByIdAndUpdate(
            userBehavior._id,
            { $set: { events: updatedEvents } },
            { runValidators: true }
          );
          
          updatedCount++;
          console.log(`Updated UserBehavior document: ${userBehavior._id}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`Error updating UserBehavior ${userBehavior._id}:`, error.message);
        
        // If validation still fails, remove problematic events
        try {
          const validEvents = userBehavior.events.filter(event => {
            const validTypes = [
              "view", "click", "add_to_cart", "purchase", "like", "share", "search", "filter",
              "page_view", "view_section", "product_click", "favorite", "feedback"
            ];
            return validTypes.includes(event.type);
          });
          
          await UserBehavior.findByIdAndUpdate(
            userBehavior._id,
            { $set: { events: validEvents } },
            { runValidators: true }
          );
          
          console.log(`Cleaned invalid events from UserBehavior: ${userBehavior._id}`);
        } catch (cleanupError) {
          console.error(`Failed to cleanup UserBehavior ${userBehavior._id}:`, cleanupError.message);
        }
      }
    }
    
    console.log(`Migration completed:`);
    console.log(`- Documents updated: ${updatedCount}`);
    console.log(`- Errors encountered: ${errorCount}`);
    console.log(`- Total documents: ${userBehaviors.length}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Function to clean invalid UserBehavior documents
const cleanInvalidUserBehaviorData = async () => {
  try {
    console.log('Cleaning invalid UserBehavior data...');
    
    // Connect to database
    await connectDB();
    
    // Remove documents with validation errors
    const validTypes = [
      "view", "click", "add_to_cart", "purchase", "like", "share", "search", "filter",
      "page_view", "view_section", "product_click", "favorite", "feedback"
    ];
    
    const result = await UserBehavior.deleteMany({
      'events.type': { $nin: validTypes }
    });
    
    console.log(`Removed ${result.deletedCount} UserBehavior documents with invalid event types`);
    
    // Also clean up any events with null or undefined types
    const updateResult = await UserBehavior.updateMany(
      {},
      {
        $pull: {
          events: {
            $or: [
              { type: { $exists: false } },
              { type: null },
              { type: "" }
            ]
          }
        }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} documents to remove invalid events`);
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'migrate';
  
  if (command === 'migrate') {
    migrateUserBehaviorData();
  } else if (command === 'clean') {
    cleanInvalidUserBehaviorData();
  } else {
    console.log('Usage: node migrateUserBehavior.js [migrate|clean]');
  }
}

export { migrateUserBehaviorData, cleanInvalidUserBehaviorData };