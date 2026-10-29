const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
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

async function login(req, res) {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credential!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).toArray();
        res.json(users);

    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function getUserProfile(req, res) {
    const currentID = req.params.id || req.body?.userId || req.body?.id;
    try {
        if (!currentID || !ObjectId.isValid(currentID)) {
            return res.status(400).json({ message: "Invalid or missing User ID!" });
        }

        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID),
        });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json(user);

    } catch (err) {
        console.error("Error during fetching : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function updateUserProfile(req, res) {
    const currentID = req.params.id || req.body?.userId || req.body?.id;
    const { email, password } = req.body || {};

    try {
        if (!currentID || !ObjectId.isValid(currentID)) {
            return res.status(400).json({ message: "Invalid or missing User ID!" });
        }

        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");

        let updateFields = {};
        if (email) {
            updateFields.email = email;
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Please provide email or password to update" });
        }

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(currentID) },
            { $set: updateFields },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ message: "User Profile Updated!", user: result });

    } catch (err) {
        console.error("Error during updating : ", err.message);
        res.status(500).send("Server error!");
    }
}

async function deleteUserProfile(req, res) {
    const currentID = req.params.id || req.body?.userId || req.body?.id;
    try {
        if (!currentID || !ObjectId.isValid(currentID)) {
            return res.status(400).json({ message: "Invalid or missing User ID!" });
        }

        await connectClient();
        const db = client.db();
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ message: "User Profile Deleted!" });

    } catch (err) {
        console.error("Error during deleting : ", err.message);
        res.status(500).send("Server error!");
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
};
