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
import OmraPayment from './pages/Omra/OmraPayment';
import Billeterie from './pages/billeterie/Billeterie';
import Payment from './pages/VoyagesOrganise/Payment';
import CustomTripAbroad from './pages/CustomTripAbroad';
import PaymentHotel from './pages/PaymentHotel';
import TransportAdmin from './pages/admin/transport/TransportAdmin';
import TransportForm from './pages/admin/transport/TransportForm';
import TransportTable from './pages/admin/transport/TransportTable';
import RequestsAdmin    from './pages/admin/transport/RequestsAdmin';



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
          <Route path="/admin/transport/form" element={<TransportForm/>}/>
           <Route path="/admin/transport/table" element={<TransportTable/>}/>
           <Route path="/admin/transport/requests"      element={<RequestsAdmin />} /> 

      </Routes>
      
    </Router>
  );
}

export default App;