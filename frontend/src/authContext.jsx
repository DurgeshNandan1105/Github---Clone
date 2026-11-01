import React, { createContext, useState, useEffect, useContext } from "react";


const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({Children})=>{
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(()=>{
        const userId = localStorage.getItem('userId');
        if(userId){
            setCurrentUser(userId);
        }
    }, []);
    
    const value = {
        currentUser, setCurrentUser
    }
    return <AuthContext.Provider value={value}>{Children}</AuthContext.Provider>
}