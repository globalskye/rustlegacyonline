import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowToStart from './pages/HowToStart';
import ServerInfo from './pages/ServerInfo';
import Rules from './pages/Rules';
import Shop from './pages/Shop';
import Statistics from './pages/Statistics';
import LegalDocument from './pages/LegalDocument';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-to-start" element={<HowToStart />} />
          <Route path="/server-info" element={<ServerInfo />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/legal/:type" element={<LegalDocument />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
