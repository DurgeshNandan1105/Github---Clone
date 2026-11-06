import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetails from "./components/repo/RepoDetails";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");
        const isValidUser = userIdFromStorage && userIdFromStorage !== "undefined" && userIdFromStorage !== "null";

        if (isValidUser && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        if (!isValidUser && !["/auth", "/signup"].includes(window.location.pathname)) {
            localStorage.removeItem("userId");
            localStorage.removeItem("token");
            navigate("/auth");
        }

        if (isValidUser && window.location.pathname === "/auth") {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />
        },
        {
            path: "/auth",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path: "/create",
            element: <CreateRepo />
        },
        {
            path: "/repo/:id",
            element: <RepoDetails />
        },
        {
            path: "/repo",
            element: <Dashboard />
        },
        {
            path: "*",
            element: <Dashboard />
        }
    ]);
    return element;
};

export default ProjectRoutes;
