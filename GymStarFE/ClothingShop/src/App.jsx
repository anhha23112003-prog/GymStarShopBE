import "./App.css";
import UseRoutesCustom from "./hooks/UseRoutesCustom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import "antd/dist/reset.css";
export const NotificationContext = React.createContext();
import { setLocalStorage } from "./utils/utils";

function App() {
  const showNotification = (content, type, duration = 4000) => {
    toast[type](content, {
      position: "top-right",
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };
  const routes = UseRoutesCustom();
  return (
    <>
      <NotificationContext.Provider
        value={{
          showNotification: showNotification,
        }}
      >
        <ToastContainer />
        {routes}
      </NotificationContext.Provider>
    </>
  );
}

export default App;
