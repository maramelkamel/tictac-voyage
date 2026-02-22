import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Omra from './pages/Omra/Omra';
import Reserve from './pages/Omra/Reserve';
import Details from './pages/Omra/Details';
import CreateAccount from './pages/CreateAccount';
import SignIn from './pages/SignIn';
<<<<<<< HEAD
import TransportPage from './pages/Transport/TransportPage';

=======
import VoyagesOrganise from './pages/VoyagesOrganise/VoyagesOrganise';
>>>>>>> 9395dfe5483fc9ff314498ee6f56861c159b4af4

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Omra/Omra" element={<Omra />} />
        <Route path="/Omra/Details" element={<Details />} />
        <Route path="/Omra/Reserve" element={<Reserve />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/SignIn" element={<SignIn />} />
<<<<<<< HEAD
        <Route path="/transport" element={<TransportPage />} />
    
=======
        <Route path="/VoyagesOrganise" element={<VoyagesOrganise />} />
>>>>>>> 9395dfe5483fc9ff314498ee6f56861c159b4af4
      </Routes>
    </Router>
  );
}

export default App;