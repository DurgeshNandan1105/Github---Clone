const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository (req,res){
    const { owner, name, issues, content, description, visibility } = req.body
    try{
        if( !name) {
            return res.status(400).json({error: "Repository name is required!"});
        }
        if(!mongoose.Types.ObjectId.isValid(owner)){
            return res.status(400).json({error: "Invalid User ID!"});
        }
        // if(!mongoose.Types.ObjectId.isValid(issues)){
        //     return res.status(400).json({error: "Invalid User ID!"});
        // }

        const newRepository = new Repository({
           name, description, visibility, owner, content, issues
        });
     const result = await newRepository.save();
     res.status(201).json({
        message: "Repository created!",
        repositoryID: result._id,
     });

    } catch(err) {
       console.error("Error during repository creation : ", err.message);
       res.status(500).send("Server error");
    }
};

async function getAllRepositories(req, res){
    res.send("All Repositories fetched!!");
};

async function fetchRepositoryById(req,res){
    res.send("Repository Details Fetched!!");
};

async function fetchRepositoryByName(req, res){
    res.send("Repository Details Fetched!!");
};

async function fetchRepositoriesForCurrentUser(req,res){
    res.send("Repositories for Logged In user Fetched!!");
};

async function updateRepositoryById(req,res){
    res.send("Repository Updated!");
};

async function toggleVisibilityById(req,res){
    res.send("Visibility Toggled!");
};

async function deleteRepositoryById(req,res){
    res.send("Repository Deleted!");
};

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

