const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
    const { title, description } = req.body;
    const repositoryId = req.params.id || req.body.repository || req.body.repositoryId || req.body.repoId;

    try {
        if (!title) {
            return res.status(400).json({ error: "Issue title is required!" });
        }
        if (!repositoryId || !mongoose.Types.ObjectId.isValid(repositoryId)) {
            return res.status(400).json({ error: "Valid repository ID is required!" });
        }

        const repoExists = await Repository.findById(repositoryId);
        if (!repoExists) {
            return res.status(404).json({ error: "Repository not found!" });
        }

        const issue = new Issue({
            title,
            description: description || "",
            repository: repositoryId,
        });

        await issue.save();

        await Repository.findByIdAndUpdate(repositoryId, {
            $push: { issues: issue._id },
        });

        res.status(201).json(issue);
    } catch (err) {
        console.error("Error during issue creation:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID!" });
        }

        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        if (title !== undefined) issue.title = title;
        if (description !== undefined) issue.description = description;
        if (status !== undefined) issue.status = status;

        await issue.save();
        res.status(200).json({ message: "Issue updated", issue });
    } catch (err) {
        console.error("Error during issue updation:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function deleteIssueById(req, res) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID!" });
        }

        const issue = await Issue.findByIdAndDelete(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        if (issue.repository) {
            await Repository.findByIdAndUpdate(issue.repository, {
                $pull: { issues: id },
            });
        }

        res.status(200).json({ message: "Issue deleted" });
    } catch (err) {
        console.error("Error during issue deletion:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function getAllIssues(req, res) {
    const repositoryId = req.params.id || req.query.repository || req.query.repoId;

    try {
        let query = {};
        if (repositoryId) {
            if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
                return res.status(400).json({ error: "Invalid repository ID!" });
            }
            query.repository = repositoryId;
        }

        const issues = await Issue.find(query).populate("repository");
        res.status(200).json(issues || []);
    } catch (err) {
        console.error("Error during issue fetching:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

async function getIssueById(req, res) {
    const { id } = req.params;

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid issue ID!" });
        }

        const issue = await Issue.findById(id).populate("repository");
        if (!issue) {
            return res.status(404).json({ error: "Issue not found!" });
        }

        res.status(200).json(issue);
    } catch (err) {
        console.error("Error during issue fetching:", err.message);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
};
