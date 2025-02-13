import mongoose, { model, models } from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

export const User = models.User || model('User', userSchema, 'users');