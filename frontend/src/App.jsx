import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Omra from './pages/Omra/Omra';
import Reserve from './pages/Omra/Reserve';
import Details from './pages/Omra/Details';
import CreateAccount from './pages/CreateAccount';
import SignIn from './pages/SignIn';
<<<<<<< HEAD
import VoyagesOrganise from './pages/VoyagesOrganise/VoyagesOrganise';
=======
import TransportPage from './pages/Transport/TransportPage';
import VoyagesOrganise from './pages/VoyagesOrganise/VoyagesOrganise';
import Detail from './pages/VoyagesOrganise/Detail';
import Reserver from './pages/VoyagesOrganise/Reserver';


>>>>>>> bec21f0c16927ee0e730a68690befdbb80beaec9

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
        <Route path="/VoyagesOrganise" element={<VoyagesOrganise />} />
=======
        <Route path="/transport" element={<TransportPage />} />

        <Route path="/VoyagesOrganise/VoyagesOrganise" element={<VoyagesOrganise />} />
        <Route path="/VoyagesOrganise/Detail" element={<Detail />} />
        <Route path="/VoyagesOrganise/Reserver" element={<Reserver />} />
>>>>>>> bec21f0c16927ee0e730a68690befdbb80beaec9
      </Routes>
      
    </Router>
  );
}

export default App;