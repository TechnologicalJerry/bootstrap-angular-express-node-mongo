import mongoose from "mongoose";
import config from "config";
import bcrypt from "bcrypt";

export interface UserInput {
    name: string;
  }