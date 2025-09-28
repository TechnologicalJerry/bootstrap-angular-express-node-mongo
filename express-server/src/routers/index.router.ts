import { Router, Request, Response } from "express";
import usersRouter from "./users.router";
import authRouter from "./auth.router";
import productsRouter from "./products.router";
import sessionsRouter from "./sessions.router";

const router = Router();

// Health check endpoint
router.get("/healthcheck", (req: Request, res: Response) => {
    const serverInfo = {
        status: "🚀 Server is running!",
        message: "Express Server API is healthy and ready to serve requests",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users", 
            products: "/api/products",
            sessions: "/api/sessions"
        },
        features: [
            "🔐 JWT Authentication",
            "👥 User Management", 
            "📦 Product Management",
            "🔍 Search & Filtering",
            "📄 Pagination",
            "✅ Input Validation",
            "🧪 Comprehensive Testing",
            "📚 Postman Collection",
            "📊 Session Tracking",
            "🖥️ Device Analytics"
        ]
    };
    
    console.log('\n🎉 ===========================================');
    console.log('🎉           HEALTH CHECK REQUEST');
    console.log('🎉 ===========================================');
    console.log(`⏰ Time: ${serverInfo.timestamp}`);
    console.log(`🔄 Uptime: ${Math.floor(serverInfo.uptime)}s`);
    console.log(`🌍 Environment: ${serverInfo.environment.toUpperCase()}`);
    console.log(`📡 Status: ${serverInfo.status}`);
    console.log('🎉 ===========================================\n');
    
    res.status(200).json({
        success: true,
        data: serverInfo
    });
});

// Mount routers
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);

export default router;
