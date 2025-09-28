import express from 'express';
import cors from 'cors';
import router from "./routers/index.router";

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        // process.env.CORS_ORIGIN,
        'http://localhost:4200', // Angular dev server
        'http://localhost:3000', // React dev server
        'http://127.0.0.1:4200',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api", router);

export default app;
