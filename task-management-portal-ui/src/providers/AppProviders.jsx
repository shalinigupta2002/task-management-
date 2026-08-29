import PropTypes from "prop-types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmProvider } from "./ConfirmProvider";
import GlobalSearchProvider from "./GlobalSearchProvider";

export default function AppProviders({ children }) {
  return (
    <ConfirmProvider>
      <GlobalSearchProvider>
        {children}
      </GlobalSearchProvider>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: 12,
          fontFamily: "Inter, sans-serif",
          fontSize: "0.875rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      />
    </ConfirmProvider>
  );
}

AppProviders.propTypes = { children: PropTypes.node.isRequired };
