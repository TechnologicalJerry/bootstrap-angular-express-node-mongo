import express from 'express';
import config from 'config';
import routes from "./routes";
import swaggerDocs from "./utilitys/swagger";

const app = express();

// Middleware
app.use(express.json());

// Routes
routes(app);

// Swagger documentation
const PORT = config.get<number>('port');
swaggerDocs(app, PORT);

export default app;
