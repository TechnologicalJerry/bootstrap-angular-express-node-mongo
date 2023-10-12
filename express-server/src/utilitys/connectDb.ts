import mongoose from "mongoose";
import config from 'config';

function connect() {
    const dbUrl = config.get<string>('databadeUrl');
}