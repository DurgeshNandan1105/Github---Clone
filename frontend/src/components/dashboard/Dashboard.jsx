import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      if (!userId || userId === "undefined") return;
      try {
        const response = await fetch(
          `http://localhost:3000/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(Array.isArray(data.repositories) ? data.repositories : []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (!Array.isArray(repositories)) {
      setSearchResults([]);
      return;
    }
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {Array.isArray(suggestedRepositories) && suggestedRepositories.length > 0 ? (
            suggestedRepositories.slice(0, 8).map((repo) => (
              <div
                key={repo._id}
                className="suggested-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description"}</p>
              </div>
            ))
          ) : (
            <p style={{ color: "grey", fontSize: "13px" }}>No suggested repositories</p>
          )}
        </aside>

        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Type to search repositories..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.map((repo) => (
              <div
                key={repo._id}
                className="dashboard-repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <h4>
                  <span>{repo.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      border: "1px solid #30363d",
                      color: repo.visibility ? "#58a6ff" : "#d29922",
                    }}
                  >
                    {repo.visibility ? "Public" : "Private"}
                  </span>
                </h4>
                <p>{repo.description || "No description provided."}</p>
                <div className="dashboard-repo-meta">
                  <span>Files: {repo.content?.length || 0}</span>
                  <span>Issues: {repo.issues?.length || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "grey" }}>
              <p>No repositories found</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create")}
                style={{ marginTop: "12px", background: "#238636", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}
              >
                Create your first repository
              </button>
            </div>
          )}
        </main>

        <aside>
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li>
              <strong>Tech Conference</strong>
              <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: "12px" }}>Dec 15 &bull; Online</p>
            </li>
            <li>
              <strong>Developer Meetup</strong>
              <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: "12px" }}>Jan 25 &bull; Main Stage</p>
            </li>
            <li>
              <strong>React Hackathon</strong>
              <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: "12px" }}>Feb 10 &bull; Global</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
}

export default Dashboard;
