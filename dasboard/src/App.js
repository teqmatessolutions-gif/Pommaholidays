import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import { ProtectedRoute } from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard.jsx";
import RoleForm from "./pages/Roleform.jsx";
import Bookings from "./pages/Bookings.jsx";
import CreateRooms from "./pages/CreateRooms.jsx";
import Users from "./pages/Users.jsx";
import Services from "./pages/Services.jsx";
import Expenses from "./pages/Expenses.jsx";
import FoodOrder from "./pages/FoodOrders.jsx";
import FoodCategory from "./pages/FoodCategory.jsx";
import FoodItem from "./pages/Fooditem.jsx";
import Billing from "./pages/Billing.jsx";
import Account from "./pages/Account.jsx";
import Userfrontend_data from "./pages/Userfrontend_data.jsx"; // ✅ Add FoodItem import

import Package from "./pages/Package.jsx"; // ✅ Add FoodItem import
import ComprehensiveReport from "./pages/ComprehensiveReport.jsx";
import GuestProfile from "./pages/GuestProfile.jsx";
import UserHistory from "./pages/UserHistory.jsx";
import EmployeeManagement from "./pages/EmployeeManagement.jsx";

function App() {
  // For Pomma admin, use /pommaadmin as basename
  // This ensures all routes work under /pommaadmin/ path with pommodb
  const getBasename = () => {
    // Check if we're running in Pomma context (using pommodb)
    // If PUBLIC_URL is set to /pommaadmin, use /pommaadmin
    if (process.env.PUBLIC_URL === '/pommaadmin') {
      return '/pommaadmin';
    }
    // Otherwise, detect from current path
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      // If accessing from /pommaadmin, use /pommaadmin as basename
      if (path.startsWith('/pommaadmin')) {
        return '/pommaadmin';
      }
      // If accessing from /admin but using pommodb (Pomma build), use /pommaadmin
      if (path.startsWith('/admin')) {
        // Check if this is Pomma build by checking API URL
        // For Pomma admin, always use /pommaadmin
        return '/pommaadmin';
      }
    }
    // Default to /pommaadmin for Pomma admin
    return '/pommaadmin';
  };

  const basename = getBasename();

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredPermission="/dashboard">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute requiredPermission="/bookings">
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute requiredPermission="/rooms">
            <CreateRooms />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredPermission="/users">
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute requiredPermission="/services">
            <Services />
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute requiredPermission="/expenses">
            <Expenses />
          </ProtectedRoute>
        } />
        {/* Protected Routes */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPermission="/roles">
              <RoleForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredPermission="/billing">
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-orders"
          element={
            <ProtectedRoute requiredPermission="/food-orders">
              <FoodOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-categories"
          element={
            <ProtectedRoute requiredPermission="/food-categories">
              <FoodCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/food-items"
          element={
            <ProtectedRoute requiredPermission="/food-items">
              <FoodItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute requiredPermission="/account">
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Userfrontend_data"
          element={
            <ProtectedRoute requiredPermission="/Userfrontend_data">
              <Userfrontend_data />
            </ProtectedRoute>
          }
        />
        <Route
          path="/package"
          element={
            <ProtectedRoute requiredPermission="/package">
              <Package />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute requiredPermission="/report">
              <ComprehensiveReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guestprofiles"
          element={
            <ProtectedRoute requiredPermission="/guestprofiles">
              <GuestProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-history"
          element={
            <ProtectedRoute requiredPermission="/user-history">
              <UserHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-management"
          element={
            <ProtectedRoute requiredPermission="/employee-management">
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
