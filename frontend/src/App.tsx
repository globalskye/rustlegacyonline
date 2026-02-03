import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AppProvider, useLanguageDetect } from './context/AppContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { Analytics } from './components/Analytics';
import Home from './pages/Home';
import HowToStart from './pages/HowToStart';
import ServerInfo from './pages/ServerInfo';
import Rules from './pages/Rules';
import Shop from './pages/Shop';
import Statistics from './pages/Statistics';
import News from './pages/News';
import LegalDocument from './pages/LegalDocument';
import Company from './pages/Company';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import './App.css';

function AppContent() {
  useLanguageDetect();
  return (
    <div className="app">
      <div className="background-layer" />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/how-to-start" element={<HowToStart />} />
        <Route path="/server-info" element={<ServerInfo />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/legal/:type" element={<LegalDocument />} />
        <Route path="/company" element={<Company />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppProvider>
        <Analytics />
        <AppContent />
      </AppProvider>
    </Router>
  );
};

export default App;
