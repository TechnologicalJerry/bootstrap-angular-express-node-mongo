import mongoose from "mongoose";
import config from 'config';
import logger from "./logger";

async function connect() {
    const databaseHost = config.get<string>('databaseHost');
    const databaseName = config.get<string>('databaseName');
    const dbUrl = `mongodb://${databaseHost}/${databaseName}`;
    
    try {
        console.log(`🔗 Attempting to connect to MongoDB...`);
        console.log(`📊 Database: ${databaseName}`);
        console.log(`🏠 Host: ${databaseHost}`);
        
        await mongoose.connect(dbUrl);
        
        console.log(`✅ Successfully connected to MongoDB!`);
        console.log(`📊 Database: ${databaseName}`);
        console.log(`🏠 Host: ${databaseHost}`);
        logger.info(`Database connected successfully: ${databaseName} on ${databaseHost}`);
        
    } catch (error: any) {
        console.log(`❌ Failed to connect to MongoDB!`);
        console.log(`📊 Database: ${databaseName}`);
        console.log(`🏠 Host: ${databaseHost}`);
        console.log(`🚨 Error: ${error.message}`);
        logger.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
}

export default connect;