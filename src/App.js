import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Tabs from './components/Tabs';
import Auth from './components/Auth';
import { auth } from './firebase';

const App = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/chats" /> : <Auth setUser={setUser} />}
          />
          <Route
            path="/chats"
            element={
              user ? (
                <div className="flex h-screen">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <button onClick={() => auth.signOut()} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 mb-4">Sign Out</button>
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <ChatList tab={activeTab} />
                  </div>
                  <div className="w-2/3">
                    <ChatWindow />
                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
