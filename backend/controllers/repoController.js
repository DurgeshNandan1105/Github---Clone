const createRepository = (req,res) => {
    res.send("Repository created!");
};

const getAllRepositories = (req, res) => {
    res.send("All Repositories fetched!!");
};

const fetchRepositoryById = (req,res) => {
    res.send("Repository Details Fetched!!");
};

const fetchRepositoryByName = (req, res) => {
    res.send("Repository Details Fetched!!");
};

const fetchRepositoriesForCurrentUser = (req,res) => {
    res.send("Repositories for Logged In user Fetched!!");
};

const updateRepositoryById = (req,res) => {
    res.send("Repository Updated!");
};

const toggleVisibilityById = (req,res) => {
    res.send("Visibility Toggled!");
};

const deleteRepositoryById = (req,res) => {
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

