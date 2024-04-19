import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const socket = io("https://chat4me.onrender.com", {
        query: {
          userId: authUser._id,
        },
      });

      setSocket(socket);

      // Listen for online users
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Listen for new messages
      socket.on("newMessage", (message) => {
        console.log("New message received:", message);
        // Handle new message (e.g., update chat UI)
      });

      return () => socket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
