import React from "react";
import "../App.css";
import image from '../assets/minilogo.png'
const Load = () => {
  return (
    <div className="App">
      <img
        src={image}
        alt="Logo"
        border="0"
        className="logo"
        style={{ width: "200px", height: "auto" }}
      />
      <h1 className="app-name">CRS</h1>
      <div className="powered-by">Powered by EXODUS</div>
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    </div>
  );
};

export default Load;
