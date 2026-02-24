import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Omra from './pages/Omra/Omra';
import Reserve from './pages/Omra/Reserve';
import Details from './pages/Omra/Details';
import CreateAccount from './pages/CreateAccount';
import SignIn from './pages/SignIn';
import Transport from './pages/Transport/Transport';
import VoyagesOrganise from './pages/VoyagesOrganise/VoyagesOrganise';
import Detail from './pages/VoyagesOrganise/Detail';
import Reserver from './pages/VoyagesOrganise/Reserver';
import HotelDetails from './pages/HotelDetails';
import Contact from './pages/Contact';



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
        <Route path="/transport" element={<Transport />} />

        <Route path="/VoyagesOrganise/VoyagesOrganise" element={<VoyagesOrganise />} />
        <Route path="/VoyagesOrganise/Detail/:id" element={<Detail />} />
        <Route path="/VoyagesOrganise/Reserver/:id" element={<Reserver />} />
         <Route path="/hotels/:id" element={<HotelDetails />} />
         <Route path="/Contact" element={<Contact/>} />
      </Routes>
      
    </Router>
  );
}

export default App;