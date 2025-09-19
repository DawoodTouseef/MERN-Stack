import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
} from "@mui/material";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import io from "socket.io-client";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get user data from Redux
  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?._id
  const userName = userInfo?.name

  // Initialize Socket.IO client
  const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5500"; // Empty string defaults to current host
  const socket = io(socketUrl, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: Cookies.get("jwt"), // JWT from cookie
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!userInfo) {
      toast.error("Please log in to use live chat.", { position: "top-right", autoClose: 3000 });
      return;
    }

    socket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to live chat!", { position: "top-right", autoClose: 3000 });
      socket.emit("join", { userId, userName });
    });

    socket.on("connect_error", (err) => {
      toast.error(`Connection failed: ${err.message}`, { position: "top-right", autoClose: 3000 });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from chat. Reconnecting...", { position: "top-right", autoClose: 3000 });
    });

    socket.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    });

    socket.on("typing", ({ userId: typingUserId }) => {
      if (typingUserId !== userId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("previousMessages");
      socket.off("message");
      socket.off("typing");
      socket.disconnect();
    };
  }, [userId, userName]); // Dependencies to re-run if user changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!isConnected) {
      toast.error("Not connected to chat. Please wait...", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (!userInfo) {
      toast.error("Please log in to send messages.", { position: "top-right", autoClose: 3000 });
      return;
    }

    const newMessage = {
      sender: userName,
      userId,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleTyping = () => {
    if (userInfo) {
      socket.emit("typing", { userId });
    }
  };

  const handleCloseChat = () => {
    socket.disconnect();
    toast.info("Chat session ended.", { position: "top-right", autoClose: 3000 });
  };

  if (!userInfo) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 4 },
          background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            maxWidth: 600,
            width: "100%",
            mx: "auto",
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
            background: "#fff",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "#ec4899", mb: 2 }}>
            Live Chat Support
          </Typography>
          <Typography variant="body1" sx={{ color: "#18181b", mb: 2 }}>
            Please{" "}
            <Link
              href="/login"
              sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              log in
            </Link>{" "}
            to access live chat support.
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Need help? Visit our{" "}
            <Link
              href="/faq"
              sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              FAQ
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Contact Us
            </Link>.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 600,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          height: "80vh",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#ec4899", letterSpacing: 0.5 }}
          >
            Live Chat Support
          </Typography>
          <IconButton onClick={handleCloseChat} sx={{ color: "#ad1457" }}>
            <FaTimes />
          </IconButton>
        </Stack>
        <Typography variant="subtitle1" sx={{ color: "#6366f1", mb: 2 }}>
          {isConnected ? "Connected to a support agent" : "Connecting..."}
        </Typography>
        <Divider sx={{ mb: 3, bgcolor: "#e3eeff" }} />

        {/* Chat Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mb: 2,
            p: 2,
            bgcolor: "#f9fafb",
            borderRadius: 2,
            maxHeight: "60vh",
          }}
        >
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: msg.sender === userName ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        bgcolor: msg.sender === userName ? "#ec4899" : "#e3eeff",
                        color: msg.sender === userName ? "#fff" : "#18181b",
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: "70%",
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    msg.sender !== "System" && (
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {msg.sender}
                      </Typography>
                    )
                  }
                  sx={{ m: 0 }}
                />
              </ListItem>
            ))}
            {isTyping && (
              <ListItem>
                <Typography variant="caption" sx={{ color: "#666", fontStyle: "italic" }}>
                  Agent is typing...
                </Typography>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Message Input */}
        <form onSubmit={handleSendMessage}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleTyping}
              disabled={!isConnected}
              sx={{
                bgcolor: "#f9fafb",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e3eeff" },
                  "&:hover fieldset": { borderColor: "#ec4899" },
                  "&.Mui-focused fieldset": { borderColor: "#ec4899" },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={!isConnected || !message.trim()}
              sx={{
                borderRadius: 2,
                bgcolor: "#ec4899",
                "&:hover": { bgcolor: "#be185d" },
                minWidth: 60,
                height: 40,
              }}
            >
              <FaPaperPlane />
            </Button>
          </Stack>
        </form>

        {/* Support Links */}
        <Divider sx={{ my: 3, bgcolor: "#e3eeff" }} />
        <Typography variant="body2" sx={{ color: "#666", textAlign: "center" }}>
          Need more help? Check our{" "}
          <Link
            href="/faq"
            sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            FAQ
          </Link>{" "}
          or visit our{" "}
          <Link
            href="/contact"
            sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Contact Us
          </Link>{" "}
          page.
        </Typography>
      </Paper>
    </Box>
  );
};

export default LiveChat;