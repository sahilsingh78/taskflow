import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = () => {
  return (
    <div className="app-container">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="main-content">
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AppLayout;