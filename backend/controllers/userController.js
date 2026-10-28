
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGO_URL;
let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        console.log("MongoDB connected");
    }
}

async function signup(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is missing"
            });
        }

        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({
                message: "Username, password and email are required"
            });
        }

        await connectClient();

        const db = client.db();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ username });

        if (user) {
            return res.status(400).json({
                message: "User already exists!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: []
        };

        const result = await usersCollection.insertOne(newUser);

        const token = jwt.sign(
            { id: result.insertedId.toString() },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(201).json({ token });

    } catch (err) {
        console.error("Error during signup:", err);

        return res.status(500).json({
            message: "Server error"
        });
    }
}

async function login (req, res) {
    const { email, password } = req.body;
    try{
        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "Invalid credential!"});
        }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({ message: "Invalid credentials!"});
    }
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET_KEY, {expiresIn:"1h"});
    res.json({token, userId:user._id});
    } catch(err){
        console.error("Error during login : ", err.message);
        res.status(500).send("Server error!");
    }
};

const getUserProfile = (req, res) => {
    res.send("Profile fetched");
};

const getAllUsers = (req, res) => {
    res.send("All users fetched!");
};

const updateUserProfile = (req, res) => {
    res.send("Profile updated!");
};

const deleteUserProfile = (req, res) => {
    res.send("Profile deleted!");
};

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};
