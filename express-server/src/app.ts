import express from 'express';
import router from "./routers/index.router";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", router);

export default app;
