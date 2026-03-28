import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/hotel/HomePage';
import Omra from './pages/Omra/Omra';
import Reserve from './pages/Omra/Reserve';
import Details from './pages/Omra/Details';
import CreateAccount from './pages/CreateAccount';
import SignIn from './pages/SignIn';
import Transport from './pages/Transport/Transport';
import VoyagesOrganise from './pages/VoyagesOrganise/VoyagesOrganise';
import Detail from './pages/VoyagesOrganise/Detail';
import Reserver from './pages/VoyagesOrganise/Reserver';
import HotelDetails from './pages/hotel/HotelDetails';
import Contact from './pages/Contact';
import OmraPayment from './pages/Omra/OmraPayment';
import Billeterie from './pages/billeterie/Billeterie';
import Payment from './pages/VoyagesOrganise/Payment';
import CustomTripAbroad from './pages/CustomTripAbroad';
import PaymentHotel from './pages/hotel/PaymentHotel';
import TransportAdmin from './pages/admin/transport/TransportAdmin';
import RequestsAdmin    from './pages/admin/transport/RequestsAdmin';
import Dashboard        from './pages/admin/dashboard/Dashboard';
import SurMesureAdmin   from './pages/admin/surMesure/SurMesureAdmin';
import ContactAdmin     from './pages/admin/contact/ContactAdmin';

import OmraPackages      from './pages/admin/Omra/OmraPackages';
import OmraReservations  from './pages/admin/Omra/OmraReservations';
import ClientsAdmin from './pages/admin/clients/ClientsAdmin';
import ClientProfile from './pages/ClientProfile';
import VoyagePackages    from './pages/admin/voyages/VoyagePackages';
import VoyageReservations from './pages/admin/voyages/VoyageReservations';
import CircuitDetails    from './pages/circuits/CircuitDetails';
import CircuitReserver   from './pages/circuits/CircuitReserver';
import CircuitPayment    from './pages/circuits/CircuitPayment';
import CircuitPackages   from './pages/admin/circuits/CircuitPackages';
import CircuitReservations from './pages/admin/circuits/CircuitReservations';
import Circuit from './pages/circuits/circuit'
import PromotionsAdmin from './pages/admin/promotions/PromotionsAdmin';



function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Omra/Omra" element={<Omra />} />
        <Route path="/Omra/Details/:id" element={<Details />} />
        <Route path="/Omra/Reserve/:id" element={<Reserve />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/Omra/OmraPayment/:id" element={<OmraPayment />} />  
        <Route path="/VoyagesOrganise/VoyagesOrganise" element={<VoyagesOrganise />} />
        <Route path="/VoyagesOrganise/Detail/:id" element={<Detail />} />
        <Route path="/VoyagesOrganise/Reserver/:id" element={<Reserver />} />
         <Route path="/hotels/:id" element={<HotelDetails />} />
         <Route path="/Contact" element={<Contact/>} />
         <Route path="/billeterie/Billeterie" element={<Billeterie/>} />
         <Route path="/VoyagesOrganise/Payment/:id" element={<Payment />} />
         <Route path="/CustomTripAbroad" element={<CustomTripAbroad/>} />
         <Route path="/PaymentHotel" element={<PaymentHotel/>}/>
         <Route path="/admin/transport" element={<TransportAdmin/>}/>
           <Route path="/admin/transport/requests"element={<RequestsAdmin />} /> 
           <Route path="/admin" element={<Dashboard />} />
           <Route path="/admin/sur-mesure"element={<SurMesureAdmin />} />
           <Route path="/admin/contact"element={<ContactAdmin />} />

           <Route path="/admin/omra/packages"     element={<OmraPackages />} />
          <Route path="/admin/omra/reservations" element={<OmraReservations />} />
           <Route path="/admin/clients/ClientsAdmin" element={<ClientsAdmin />} />
           <Route path="/mon-compte" element={<ClientProfile />} />
           <Route path="/admin/voyages/VoyagePackages"              element={<VoyagePackages />} />
           <Route path="/admin/voyages/VoyageReservations" element={<VoyageReservations />} />
          
           <Route path="/circuits/CircuitDetails/:id"        element={<CircuitDetails />} />
            <Route path="/circuits/CircuitReserver/:id"       element={<CircuitReserver />} />
            <Route path="/circuits/CircuitPayment/:id"       element={<CircuitPayment />} />
            <Route path="/admin/circuits/CircuitPackages"              element={<CircuitPackages />} />
            <Route path="/admin/circuits/CircuitReservations" element={<CircuitReservations />} />
             <Route path="/circuits/circuit" element={<Circuit />} />

<Route path="/admin/promotions" element={<PromotionsAdmin />} />
      </Routes>
      
    </Router>
  );
}

export default App;