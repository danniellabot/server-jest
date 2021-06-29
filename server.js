import express, { json } from "express";
import router from "./routes";

const app = express();

const createServer = () => {
  try {
    app.use(json());
    app.use("/api", router)
    return app;
  } catch(err) {
    throw new Error('Something went wrong')
  }
}

export default createServer;
