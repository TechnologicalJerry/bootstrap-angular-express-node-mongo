import mongoose from "mongoose";
import config from "config";
import bcrypt from "bcrypt";

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
}