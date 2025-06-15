import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Box } from "@mui/material";

const App = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Ensures the page takes up the full viewport height
        margin: 0,
        padding: 0,
        bgcolor: "#f9fafb", // Light background for the entire app
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <NavBar />
      <Box
        component="main"
        sx={{
          flex: 1, // Allows the main content to expand and push the footer to the bottom
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
          bgcolor: "#ffffff", // White background for the main content
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow for the main content
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default App;