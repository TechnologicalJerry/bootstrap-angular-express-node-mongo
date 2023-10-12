import express, { Request, Response } from "express";

const app = express();

const PORT = 5050;

app.listen(PORT, () => {
    console.log(`Server is running!!!!!!!! on PORT = ${PORT}`);
})


