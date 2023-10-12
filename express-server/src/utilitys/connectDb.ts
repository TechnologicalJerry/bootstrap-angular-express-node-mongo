import mongoose from "mongoose";
import config from 'config';
import logger from "./logger";

function connect() {
    const dbUrl = config.get<string>('databadeUrl');

    try {
        mongoose.connect(dbUrl);
        logger.info("DB connected");
    } catch (error) {
        logger.error("Could not connect to db");
        process.exit(1);
    }
}

export default connect;