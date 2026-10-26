const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    password: {
        type: String,
    },
    repositories: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],
    followedUsers: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Users",
        },
    ],
    starRepos: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],

});

const User = mongoose.model("User", userSchema);
export default User;