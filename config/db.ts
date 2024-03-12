import mongoose from "mongoose";
import { MONGO_URI } from ".";

export const connectDb = () => {
  mongoose
    .connect(MONGO_URI)
    .then((res) => console.log("MongoDb connected"))
    .catch((err) => {
      process.exit(1);
    });
};
