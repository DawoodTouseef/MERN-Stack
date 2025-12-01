const mongoose = require('mongoose');
const Auth = require('../models/AuthModel');

// Test the Auth model
const testAuthModel = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Create a test auth log
    const testAuthLog = new Auth({
      user: new mongoose.Types.ObjectId(),
      action: 'login',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      sessionId: 'abc123xyz',
    });
    
    // Save the test auth log
    const savedAuthLog = await testAuthLog.save();
    console.log('Saved auth log:', savedAuthLog);
    
    // Retrieve the auth log
    const retrievedAuthLog = await Auth.findById(savedAuthLog._id);
    console.log('Retrieved auth log:', retrievedAuthLog);
    
    // Test different action types
    const actions = ['logout', 'failed_login', 'password_reset_request', 'password_reset'];
    
    for (const action of actions) {
      const authLog = new Auth({
        user: new mongoose.Types.ObjectId(),
        action: action,
        ipAddress: '192.168.1.1',
        userAgent: 'Test User Agent',
        success: action === 'failed_login' ? false : true,
        failureReason: action === 'failed_login' ? 'Invalid credentials' : null,
        sessionId: 'test123',
      });
      
      const savedLog = await authLog.save();
      console.log(`Saved ${action} log:`, savedLog._id);
    }
    
    // Retrieve all auth logs
    const allAuthLogs = await Auth.find().sort({ timestamp: -1 }).limit(10);
    console.log('All auth logs count:', allAuthLogs.length);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

// Run the test
testAuthModel();