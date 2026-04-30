import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = () => {
  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar-wrapper">
        <Sidebar />
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">

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