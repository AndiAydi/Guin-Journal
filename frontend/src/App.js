import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HOME } from "@/constants/testIds";
import LoginForm from "@/components/Auth/LoginForm";
import SignupForm from "@/components/Auth/SignupForm";
import ChatInterface from "@/components/Chat/ChatInterface";

function App() {
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // In a real app, we'd validate this with the backend
      // For now, we'll just note that user might be authenticated
      console.log('Found existing auth token');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setCurrentSessionId(null);
  };

  const handleNewSession = (session) => {
    setCurrentSessionId(session.session_id);
  };

  // If not authenticated, show login/signup forms
  if (!user) {
    return isLoginView ? (
      <LoginForm 
        onLoginSuccess={handleLoginSuccess}
        onToggleToSignup={() => setIsLoginView(false)}
      />
    ) : (
      <SignupForm 
        onSignupSuccess={handleSignupSuccess}
        onToggleToLogin={() => setIsLoginView(true)}
      />
    );
  }

  // If authenticated, show chat interface
  return (
    <div className="h-screen flex flex-col">
      {/* Top bar with user info */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="text-sm text-muted-foreground">
          Welcome, {user.name || user.email}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface 
          sessionId={currentSessionId}
          onNewSession={handleNewSession}
        />
      </div>
    </div>
  );
}

export default App;


