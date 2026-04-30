import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoomProvider, useRoom } from './context/RoomContext';

import { LandingView } from './views/LandingView';
import { CreateRoomView } from './views/CreateRoomView';
import { EventDashboard } from './views/EventDashboard';
import { AlertsView } from './views/AlertsView';
import { MapView } from './views/MapView';
import { ChatView } from './views/ChatView';
import { SettingsView } from './views/SettingsView';

const PrivateRoute = ({ children }) => {
  const { roomState } = useRoom();
  if (!roomState.joinedRole) return <Navigate to="/" />;
  return children;
};

// Protect public paths like Join and Create so they redirect to the dashboard if already logged in.
const PublicRoute = ({ children }) => {
  const { roomState } = useRoom();
  if (roomState.joinedRole) return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/create" element={<CreateRoomView />} />
      
      <Route path="/dashboard" element={<PrivateRoute><EventDashboard /></PrivateRoute>} />
      <Route path="/alerts" element={<PrivateRoute><AlertsView /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><ChatView /></PrivateRoute>} />
      <Route path="/map" element={<PrivateRoute><MapView /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsView /></PrivateRoute>} />
      
      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <RoomProvider>
      <Router>
        <AppRoutes />
      </Router>
    </RoomProvider>
  );
}

export default App;
