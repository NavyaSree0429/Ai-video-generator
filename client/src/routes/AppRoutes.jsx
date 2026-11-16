import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';

import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VideoStudio from '../pages/VideoStudio';
import VideoEditor from '../pages/VideoEditor';
import Projects from '../pages/Projects';
import Instagram from '../pages/Instagram';
import Publishing from '../pages/Publishing';
import History from '../pages/History';
import Settings from '../pages/Settings';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950/80">
        {children}
      </main>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Studio Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/studio" element={<Layout><VideoStudio /></Layout>} />
        <Route path="/editor" element={<Layout><VideoEditor /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/instagram" element={<Layout><Instagram /></Layout>} />
        <Route path="/publishing" element={<Layout><Publishing /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

