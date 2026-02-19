import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AppProvider, useLanguageDetect } from './context/AppContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { FloatingSocialLinks } from './components/FloatingSocialLinks';
import { Analytics } from './components/Analytics';
import Home from './pages/Home';
import HowToStart from './pages/HowToStart';
import ServerInfo from './pages/ServerInfo';
import Rules from './pages/Rules';
import Contact from './pages/Contact';
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
  useEffect(() => {
    document.getElementById('app-initial-splash')?.remove();
  }, []);
  return (
    <div className="app">
      <video
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      >
        <source src="https://rustlegacy.eu/assets/bg.webm" type="video/webm" />
      </video>
      <div className="background-layer" />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/how-to-start" element={<HowToStart />} />
        <Route path="/server-info" element={<ServerInfo />} />
        <Route path="/server-info/:serverId" element={<ServerInfo />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/legal/:type" element={<LegalDocument />} />
        <Route path="/company" element={<Company />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <FloatingSocialLinks />
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
