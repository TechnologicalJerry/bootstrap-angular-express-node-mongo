import config from 'config';
import connect from './utilitys/dbConnect';
import { runSessionCleanup } from './utilitys/session-cleanup';
import app from './app';
import dotenv from "dotenv";

dotenv.config();

const PORT = config.get<number>('port');
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_HOST = config.get<string>('databaseHost');
const DATABASE_NAME = config.get<string>('databaseName');
const DATABASE_URL = `mongodb://${DATABASE_HOST}/${DATABASE_NAME}`;

console.log('\n🚀 ===========================================');
console.log('🚀           SERVER STARTING UP');
console.log('🚀 ===========================================');
console.log(`📡 Environment: ${NODE_ENV.toUpperCase()}`);
console.log(`🌐 Server Port: ${PORT}`);
console.log(`🗄️  Database Host: ${DATABASE_HOST}`);
console.log(`📊 Database Name: ${DATABASE_NAME}`);
console.log(`🔗 Database URL: ${DATABASE_URL}`);
console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
console.log('🚀 ===========================================\n');

app.listen(PORT, async () => {
    console.log(`✅ Server is running on PORT = ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/healthcheck`);
    console.log('🔄 Connecting to database...\n');
    
    await connect();
    
    // Run session cleanup on startup
    try {
        console.log('🧹 Running session cleanup...');
        await runSessionCleanup();
        console.log('✅ Session cleanup completed');
    } catch (error) {
        console.log('⚠️ Session cleanup failed:', error);
    }
    
    console.log('\n🎉 ===========================================');
    console.log('🎉         SERVER READY TO USE!');
    console.log('🎉 ===========================================');
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`✅ Database: Connected to ${DATABASE_HOST}/${DATABASE_NAME}`);
    console.log(`✅ Environment: ${NODE_ENV.toUpperCase()}`);
    console.log('🎉 ===========================================\n');
});


