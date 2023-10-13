import express, { Request, Response } from 'express';
import config from 'config';
import connect from './utilitys/connectDb';

const app = express();

const PORT = config.get<number>('port');

app.listen(PORT, async () => {
    console.log(`Server is running!!!!!!!! on PORT = ${PORT}`);

    await connect();
})


