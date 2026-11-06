import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username", repositories: [] });
  const [activeTab, setActiveTab] = useState("overview"); // "overview" or "repos"
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const { setCurrentUser } = useAuth();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId && userId !== "undefined") {
        try {
          const response = await axios.get(
            `http://localhost:3000/userProfile/${userId}`
          );
          if (response.data) {
            setUserDetails(response.data);
            setNewEmail(response.data.email || "");
          }
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {};
      if (newEmail.trim()) updateData.email = newEmail.trim();
      if (newPassword.trim()) updateData.password = newPassword.trim();

      const res = await axios.put(`http://localhost:3000/updateProfile/${userId}`, updateData);
      setEditMessage("Profile updated successfully!");
      setIsEditing(false);
      setNewPassword("");
      if (res.data.user) {
        setUserDetails((prev) => ({ ...prev, ...res.data.user }));
      }
      setTimeout(() => setEditMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setEditMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  const reposList = Array.isArray(userDetails.repositories) ? userDetails.repositories : [];

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon={BookIcon}
          onClick={() => setActiveTab("overview")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "overview" ? "white" : "whitesmoke",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "repos" ? "page" : undefined}
          icon={RepoIcon}
          onClick={() => setActiveTab("repos")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "repos" ? "white" : "whitesmoke",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Repositories ({reposList.length})
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);
          window.location.href = "/auth";
        }}
        style={{
          position: "fixed",
          bottom: "50px",
          right: "50px",
          padding: "10px 18px",
          backgroundColor: "#b62324",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          zIndex: 100,
        }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image"></div>

          <div className="name">
            <h3>{userDetails.username || "username"}</h3>
            {userDetails.email && (
              <p style={{ color: "#8b949e", fontSize: "13px", margin: "4px 0" }}>
                {userDetails.email}
              </p>
            )}
          </div>

          <button
            className="follow-btn"
            onClick={() => setIsEditing(!isEditing)}
            style={{ cursor: "pointer" }}
          >
            {isEditing ? "Close Edit" : "Edit Profile"}
          </button>

          {isEditing && (
            <form onSubmit={handleUpdateProfile} style={{ textAlign: "left", padding: "10px 0" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: "#8b949e" }}>Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#0d1117",
                    border: "1px solid #30363d",
                    color: "white",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: "#8b949e" }}>New Password</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: "#0d1117",
                    border: "1px solid #30363d",
                    color: "white",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#238636",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Save Changes
              </button>
            </form>
          )}

          {editMessage && (
            <p style={{ color: "#3fb950", fontSize: "13px", marginTop: "8px" }}>
              {editMessage}
            </p>
          )}

          <div className="follower">
            <p>{reposList.length} Repos</p>
            <p>{userDetails.followedUsers?.length || 0} Following</p>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="heat-map-section" style={{ flex: 1, padding: "20px" }}>
            <h3 style={{ textAlign: "left", marginBottom: "16px", color: "#f0f6fc" }}>
              Contribution Activity
            </h3>
            <HeatMapProfile />
          </div>
        )}

        {activeTab === "repos" && (
          <div style={{ flex: 1, padding: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#f0f6fc", margin: 0 }}>Repositories</h3>
              <button
                onClick={() => navigate("/create")}
                style={{
                  padding: "6px 14px",
                  background: "#238636",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                New Repository
              </button>
            </div>

            {reposList.length > 0 ? (
              <div className="repo-card-wrapper" style={{ justifyContent: "flex-start", padding: 0 }}>
                {reposList.map((repo) => (
                  <div
                    key={repo._id}
                    className="repo"
                    onClick={() => navigate(`/repo/${repo._id}`)}
                    style={{ cursor: "pointer", background: "#161b22" }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="repo-name">{repo.name}</span>
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
                      </div>
                      <p className="description" style={{ marginTop: "8px" }}>
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <div style={{ fontSize: "12px", color: "#6e7681", display: "flex", gap: "14px" }}>
                      <span>Files: {repo.content?.length || 0}</span>
                      <span>Issues: {repo.issues?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#8b949e", textAlign: "center", padding: "40px" }}>
                <p>No repositories found for this user.</p>
                <button
                  onClick={() => navigate("/create")}
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    background: "#238636",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Create your first repository
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
