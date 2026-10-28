const createIssue = (req,res) => {
    res.send("Repository created");
};

const updateIssueById = (req,res) => {
    res.send("Issue updated!");
};

const deleteIssueById = (req,res) => {
    res.send("Issue deleted!");
};

const getAllIssues = (req,res) => {
    res.send(" All Issue Fetched!");
};

const getIssueById = (req,res) => {
    res.send("Issue Details Fetched!");
};

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById ,
    getAllIssues,
    getIssueById,
};
