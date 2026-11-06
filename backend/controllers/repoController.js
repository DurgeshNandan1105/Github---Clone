const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
    const { owner, name, issues, content, description, visibility } = req.body;

    try {
        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Repository name is required!" });
        }
        if (!owner || !mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid User ID!" });
        }

        const existingRepo = await Repository.findOne({ name });
        if (existingRepo) {
            return res.status(400).json({ error: "Repository name already exists!" });
        }

        const newRepository = new Repository({
            name: name.trim(),
            description: description || "",
            visibility: visibility !== undefined ? visibility : true,
            owner,
            content: Array.isArray(content) ? content : (content ? [content] : []),
            issues: Array.isArray(issues) ? issues : [],
        });

        const result = await newRepository.save();

        await User.findByIdAndUpdate(owner, {
            $addToSet: { repositories: result._id },
        });

        res.status(201).json({
            message: "Repository created!",
            repositoryID: result._id,
            repository: result,
        });
    } catch (err) {
        console.error("Error during repository creation:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find({})
            .populate("owner", "-password")
            .populate("issues");
        res.json(repositories || []);
    } catch (err) {
        console.error("Error during fetching repositories:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function fetchRepositoryById(req, res) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid repository ID!" });
        }

        const repository = await Repository.findById(id)
            .populate("owner", "-password")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function fetchRepositoryByName(req, res) {
    const { name } = req.params;

    try {
        if (!name) {
            return res.status(400).json({ error: "Repository name is required!" });
        }

        const repository = await Repository.findOne({ name })
            .populate("owner", "-password")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function fetchRepositoriesForCurrentUser(req, res) {
    const userId = req.params.userID || req.user;

    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid or missing User ID!", repositories: [] });
        }

        const repositories = await Repository.find({ owner: userId }).populate("issues");
        res.json({ message: "Repositories found!", repositories: repositories || [] });
    } catch (err) {
        console.error("Error during fetching repositories for user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description, name, visibility } = req.body;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid repository ID!" });
        }

        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        if (name) repository.name = name;
        if (description !== undefined) repository.description = description;
        if (visibility !== undefined) repository.visibility = visibility;
        if (content !== undefined) {
            if (Array.isArray(content)) {
                repository.content = content;
            } else if (typeof content === "string") {
                repository.content.push(content);
            }
        }

        const updatedRepository = await repository.save();
        res.json({
            message: "Repository updated successfully!",
            repository: updatedRepository,
        });
    } catch (err) {
        console.error("Error during updating repository:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function toggleVisibilityById(req, res) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid repository ID!" });
        }

        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepository = await repository.save();

        res.json({
            message: "Repository visibility toggled successfully!",
            repository: updatedRepository,
        });
    } catch (err) {
        console.error("Error during toggling visibility:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function deleteRepositoryById(req, res) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid repository ID!" });
        }

        const repository = await Repository.findByIdAndDelete(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        if (repository.owner) {
            await User.findByIdAndUpdate(repository.owner, {
                $pull: { repositories: id },
            });
        }

        await Issue.deleteMany({ repository: id });

        res.json({ message: "Repository deleted successfully!" });
    } catch (err) {
        console.error("Error during deleting repository:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoriesForCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById,
};
