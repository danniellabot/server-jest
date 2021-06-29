import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoServer = new MongoMemoryServer();

export async function dbConnect() {
  const uri = await mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  await mongoose.connect(uri, mongooseOpts, (err) => {
    if (err) console.error(err);
  });
}

export async function dbDisconnect() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

