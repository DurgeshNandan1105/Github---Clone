import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repo.css";

const RepoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("code"); // "code" or "issues"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Code Tab state: Add file / content
  const [newFileContent, setNewFileContent] = useState("");
  const [addingContent, setAddingContent] = useState(false);

  // Issues Tab state: Create issue
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [creatingIssue, setCreatingIssue] = useState(false);

  const fetchRepoData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const repoRes = await axios.get(`http://localhost:3000/repo/${id}`);
      setRepo(repoRes.data);

      const issueRes = await axios.get(`http://localhost:3000/issue/all/${id}`);
      setIssues(Array.isArray(issueRes.data) ? issueRes.data : []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching repository details:", err);
      setError(err.response?.data?.error || "Failed to load repository details.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRepoData();
    }
  }, [id, fetchRepoData]);

  // Toggle Visibility
  const handleToggleVisibility = async () => {
    try {
      const res = await axios.patch(`http://localhost:3000/repo/toggle/${id}`);
      setRepo(res.data.repository);
      setMessage(res.data.message || "Visibility updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error toggling visibility:", err);
      alert(err.response?.data?.error || "Failed to toggle visibility");
    }
  };

  // Delete Repository
  const handleDeleteRepo = async () => {
    if (!window.confirm("Are you sure you want to delete this repository? This cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/repo/delete/${id}`);
      navigate("/");
    } catch (err) {
      console.error("Error deleting repository:", err);
      alert(err.response?.data?.error || "Failed to delete repository");
    }
  };

  // Add Content to Repo
  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!newFileContent.trim()) return;

    try {
      setAddingContent(true);
      const res = await axios.put(`http://localhost:3000/repo/update/${id}`, {
        content: newFileContent.trim(),
      });
      setRepo(res.data.repository);
      setNewFileContent("");
      setAddingContent(false);
      setMessage("Content added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error updating repository content:", err);
      setAddingContent(false);
      alert(err.response?.data?.error || "Failed to add content");
    }
  };

  // Create Issue
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueTitle.trim()) {
      alert("Issue title is required");
      return;
    }

    try {
      setCreatingIssue(true);
      const res = await axios.post(`http://localhost:3000/issue/create`, {
        title: issueTitle.trim(),
        description: issueDescription.trim(),
        repository: id,
      });

      setIssues((prev) => [res.data, ...prev]);
      setIssueTitle("");
      setIssueDescription("");
      setShowIssueForm(false);
      setCreatingIssue(false);
      setMessage("Issue created successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error creating issue:", err);
      setCreatingIssue(false);
      alert(err.response?.data?.error || "Failed to create issue");
    }
  };

  // Toggle Issue Status (open / closed)
  const handleToggleIssueStatus = async (issue) => {
    const nextStatus = issue.status === "open" ? "closed" : "open";
    try {
      const res = await axios.put(`http://localhost:3000/issue/update/${issue._id}`, {
        status: nextStatus,
      });

      setIssues((prev) =>
        prev.map((item) => (item._id === issue._id ? res.data.issue : item))
      );
    } catch (err) {
      console.error("Error updating issue status:", err);
      alert(err.response?.data?.error || "Failed to update issue status");
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Delete this issue?")) return;

    try {
      await axios.delete(`http://localhost:3000/issue/delete/${issueId}`);
      setIssues((prev) => prev.filter((item) => item._id !== issueId));
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert(err.response?.data?.error || "Failed to delete issue");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="repo-container">
          <p style={{ color: "#8b949e", textAlign: "center", marginTop: "40px" }}>
            Loading repository details...
          </p>
        </div>
      </>
    );
  }

  if (error || !repo) {
    return (
      <>
        <Navbar />
        <div className="repo-container">
          <div className="alert-box alert-error">{error || "Repository not found."}</div>
          <Link to="/" className="btn btn-secondary">
            &larr; Back to Dashboard
          </Link>
        </div>
      </>
    );
  }

  const isOwner =
    repo.owner?._id === currentUserId ||
    repo.owner === currentUserId ||
    (typeof repo.owner === "object" && String(repo.owner?._id) === String(currentUserId));

  return (
    <>
      <Navbar />
      <div className="repo-container">
        {message && <div className="alert-box alert-success">{message}</div>}

        {/* Repository Header */}
        <div className="repo-header">
          <div className="repo-title-row">
            <div className="repo-title-wrapper">
              <h1>{repo.name}</h1>
              <span
                className={`badge ${
                  repo.visibility ? "badge-public" : "badge-private"
                }`}
              >
                {repo.visibility ? "Public" : "Private"}
              </span>
            </div>

            {isOwner && (
              <div className="repo-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleToggleVisibility}
                >
                  Make {repo.visibility ? "Private" : "Public"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteRepo}
                >
                  Delete repo
                </button>
              </div>
            )}
          </div>

          <p className="repo-description">
            {repo.description || "No description provided."}
          </p>

          <div className="repo-meta">
            Owner: <strong>{repo.owner?.username || "Unknown"}</strong>
            {repo.createdAt && (
              <> &bull; Created {new Date(repo.createdAt).toLocaleDateString()}</>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="repo-tabs">
          <button
            className={`repo-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            Code
            <span className="tab-count">{repo.content?.length || 0}</span>
          </button>
          <button
            className={`repo-tab-btn ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            Issues
            <span className="tab-count">{issues.length}</span>
          </button>
        </div>

        {/* Code Tab Content */}
        {activeTab === "code" && (
          <div>
            <div className="panel">
              <div className="panel-header">
                <h3>Repository Files & Content</h3>
              </div>

              {Array.isArray(repo.content) && repo.content.length > 0 ? (
                <ul className="file-list">
                  {repo.content.map((item, idx) => (
                    <li key={idx} className="file-item">
                      <div>
                        <span className="file-name">file-{idx + 1}.txt</span>
                        <p style={{ margin: "4px 0 0 0", color: "#8b949e", fontSize: "13px", whiteSpace: "pre-wrap" }}>
                          {item}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <h4>This repository is empty</h4>
                  <p>Add files or content to get started.</p>
                </div>
              )}

              {/* Add file section */}
              {isOwner && (
                <form onSubmit={handleAddContent} style={{ marginTop: "24px" }}>
                  <h4 style={{ color: "#f0f6fc", marginBottom: "8px", fontSize: "14px" }}>
                    Add file or notes to repository:
                  </h4>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter file content or markdown text..."
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addingContent || !newFileContent.trim()}
                    style={{ marginTop: "10px" }}
                  >
                    {addingContent ? "Saving..." : "Commit file"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Issues Tab Content */}
        {activeTab === "issues" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#f0f6fc", fontSize: "18px" }}>
                Issues ({issues.length})
              </h3>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowIssueForm(!showIssueForm)}
              >
                {showIssueForm ? "Cancel" : "New Issue"}
              </button>
            </div>

            {/* New Issue Form */}
            {showIssueForm && (
              <form onSubmit={handleCreateIssue} className="panel" style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "#f0f6fc", margin: "0 0 16px 0" }}>Create a new issue</h4>
                <div className="form-group">
                  <label htmlFor="issue-title">Title *</label>
                  <input
                    id="issue-title"
                    type="text"
                    className="form-input"
                    placeholder="Issue title"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="issue-desc">Description</label>
                  <textarea
                    id="issue-desc"
                    className="form-textarea"
                    placeholder="Leave a comment / details"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingIssue || !issueTitle.trim()}
                >
                  {creatingIssue ? "Submitting..." : "Submit new issue"}
                </button>
              </form>
            )}

            {/* Issues List */}
            {issues.length > 0 ? (
              <div className="issues-list">
                {issues.map((issue) => (
                  <div key={issue._id} className="issue-card">
                    <div className="issue-main">
                      <div className="issue-title-row">
                        <span
                          className={`badge ${
                            issue.status === "open" ? "badge-open" : "badge-closed"
                          }`}
                        >
                          {issue.status}
                        </span>
                        <h4 className="issue-title">{issue.title}</h4>
                      </div>
                      {issue.description && (
                        <p className="issue-desc">{issue.description}</p>
                      )}
                      <span className="issue-meta">
                        Opened {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <div className="issue-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleToggleIssueStatus(issue)}
                      >
                        {issue.status === "open" ? "Close" : "Reopen"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeleteIssue(issue._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel empty-state">
                <h4>There aren't any open issues.</h4>
                <p>Click "New Issue" above to report a bug or request a feature.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RepoDetails;
