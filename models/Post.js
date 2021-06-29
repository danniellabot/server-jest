import { Schema, model } from "mongoose";

const PostSchema = Schema({
  title: String,
  content: String
});

export default model("Post", PostSchema);
