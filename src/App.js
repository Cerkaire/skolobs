import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Parametre from './components/Parametre';
import Saisi from './pages/Saisi';
import Obs from './pages/Obs';
import Synchro from './components/Synchro';
import { MainProvider } from './context/MainContext'; // Corrigez le chemin d'importation

function App() {
  return (
    <MainProvider>
      <>
        <Navbar />
        <Routes>
        <Route path="/lannobsgo" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/parametre" element={<Parametre />} />
          <Route path="/saisi" element={<Saisi />} />
          <Route path="/obs" element={<Obs />} />
          <Route path="/synchro" element={<Synchro />} />
        </Routes>
      </>
    </MainProvider>
  );
}

export default App;
