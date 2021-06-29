import { connect } from "mongoose";
import dotenv from 'dotenv';
import createServer from './server'

dotenv.config()

connect(process.env.MONGO_URI, { useNewUrlParser: true,  useUnifiedTopology: true })
.then(() => {
  const app = createServer()
  app.listen(6000, () => {
    console.log("Server has started!")
  })
})
