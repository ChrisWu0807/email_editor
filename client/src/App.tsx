import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TemplateProvider } from './contexts/TemplateContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateEditor from './pages/TemplateEditor';
import Campaigns from './pages/Campaigns';
import CampaignEditor from './pages/CampaignEditor';
import CampaignPreview from './pages/CampaignPreview';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <TemplateProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 公開路由 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 受保護的路由 */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="templates" element={<Templates />} />
                <Route path="templates/new" element={<TemplateEditor />} />
                <Route path="templates/:id/edit" element={<TemplateEditor />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/new" element={<CampaignEditor />} />
                <Route path="campaigns/:id/edit" element={<CampaignEditor />} />
                <Route path="campaigns/:id/preview" element={<CampaignPreview />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* 404路由 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </TemplateProvider>
    </AuthProvider>
  );
}

export default App;