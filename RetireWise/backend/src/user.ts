import * as mongodb from "mongodb";

export interface User {
  email: string;
  password: string;
  _id?: mongodb.ObjectId;
}
