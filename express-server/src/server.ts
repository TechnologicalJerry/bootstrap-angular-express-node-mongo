import config from 'config';
import connect from './utilitys/connectDb';
import app from './app';
import dotenv from "dotenv";

dotenv.config();

const PORT = config.get<number>('port');

app.listen(PORT, async () => {
    console.log(`Server is running!!!!!!!! on PORT = ${PORT}`);
    await connect();
});


