import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const storySchema = new Schema({
  userId: {
    type: String, // from clerk
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  content:{
            type:String, 
    required:true,
  },
  images:{
            type:[String], 
  },
  isPublic:{
    type:Boolean,
    default:false,
  },
  likes:{
    type: [String], // Array of user IDs who liked
    default: [],
  },
  comments: {
    type: [commentSchema],
    default: []
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},{timestamps:true});

const story =mongoose.model("Story",storySchema);

export default story;
