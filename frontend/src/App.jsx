import { Outlet } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const App = () => {

  return (
    <>
      <ToastContainer />
      <NavBar />
      <main className="py-3">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default App;
