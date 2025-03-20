import { createContext, useState, useContext } from "react";
import React from "react";

const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [userID, setUserID] = useState(null)
    return (
        <AuthContext.Provider value={{userID,setUserID}}> 
{/*         // samme som {userID:userID, setUserID:setUserID}
 */}            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)