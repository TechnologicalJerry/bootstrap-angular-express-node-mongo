import express, { Request, Response } from 'express';
import config from 'config';
import connect from './utilitys/connectDb';
import routes from "./routes";


const app = express();

const PORT = config.get<number>('port');

app.use(express.json());

app.listen(PORT, async () => {
    console.log(`Server is running!!!!!!!! on PORT = ${PORT}`);

    await connect();

    routes(app);
})


