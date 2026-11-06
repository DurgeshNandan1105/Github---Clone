import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repo.css";

const CreateRepo = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [readmeContent, setReadmeContent] = useState("# Initial README\nProject repository created with apnaGit.");
  const [includeReadme, setIncludeReadme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Repository name is required.");
      return;
    }

    if (!userId || userId === "undefined") {
      setError("Please sign in again to create a repository.");
      return;
    }

    try {
      setLoading(true);
      const content = includeReadme && readmeContent.trim() ? [readmeContent.trim()] : [];

      const res = await axios.post("http://localhost:3000/repo/create", {
        owner: userId,
        name: name.trim(),
        description: description.trim(),
        visibility: visibility,
        content: content,
      });

      setLoading(false);
      const createdId = res.data.repositoryID || res.data.repository?._id;
      if (createdId) {
        navigate(`/repo/${createdId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating repository:", err);
      setLoading(false);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create repository. Please try again."
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="repo-container">
        <div className="repo-header">
          <h1 style={{ fontSize: "24px", color: "#f0f6fc", margin: "0 0 8px 0" }}>
            Create a new repository
          </h1>
          <p style={{ color: "#8b949e", fontSize: "14px", margin: 0 }}>
            A repository contains all project files, including the revision history.
          </p>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}

        <form onSubmit={handleCreate} className="panel" style={{ maxWidth: "700px" }}>
          <div className="form-group">
            <label htmlFor="repo-name">
              Repository name <span style={{ color: "#f85149" }}>*</span>
            </label>
            <input
              id="repo-name"
              type="text"
              className="form-input"
              placeholder="e.g. my-awesome-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="repo-desc">Description (optional)</label>
            <input
              id="repo-desc"
              type="text"
              className="form-input"
              placeholder="Short description of your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div className="visibility-options">
              <label className="radio-card">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === true}
                  onChange={() => setVisibility(true)}
                />
                <div>
                  <h4>Public</h4>
                  <p>Anyone on the internet can see this repository.</p>
                </div>
              </label>

              <label className="radio-card">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === false}
                  onChange={() => setVisibility(false)}
                />
                <div>
                  <h4>Private</h4>
                  <p>Only you and designated collaborators can view this repository.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ borderTop: "1px solid #30363d", paddingTop: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={includeReadme}
                onChange={(e) => setIncludeReadme(e.target.checked)}
              />
              <span>Initialize this repository with a README</span>
            </label>
            {includeReadme && (
              <textarea
                style={{ marginTop: "10px" }}
                className="form-textarea"
                value={readmeContent}
                onChange={(e) => setReadmeContent(e.target.value)}
                placeholder="Initial README content"
              />
            )}
          </div>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: "8px 20px", fontSize: "14px" }}
            >
              {loading ? "Creating..." : "Create repository"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRepo;
