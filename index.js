import express from "express"
import mongoose from "mongoose"
import bodyparser from "body-parser"
import dotenv from "dotenv"
import routes from "./routes/userRoute.js"

const app = express();

app.use(bodyparser.json());
dotenv.config();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });
  app.use("/api/user", routes);