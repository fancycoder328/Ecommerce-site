import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../axios";
import Cookies from "js-cookie";
import createAxiosInstance from "../axios";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const axios = createAxiosInstance();

  const fetchUser = async () => {
    !isLoading && setIsLoading(true);
    try {
      const { data } = await axios.get("/api/user");
      setUser(data.user);
      setPermissions(data.permissions);
      setIsVerified(!!data.user.email_verified_at);
    } catch (error) {
      setUser(null);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    axios
      .post("/logout")
      .then(() => {
        setUser(null);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const value = {
    user,
    isLoading,
    permissions,
    isVerified,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, AuthContext, useAuth };
