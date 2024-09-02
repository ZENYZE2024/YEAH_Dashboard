
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, } from 'react-router-dom';

import Dashhboard from "./components/Dashboard/Dashboard";
import  Edittrips from './components/Editcomponent/Edittrips';
import Addtripdetails from "./components/Addtrip/Addtrip";
import Adduser from "./components/Adduser/Adduser";
import Login from "./components/Login/Login";
import Readonly from "./components/readonlylogin/Readonly";
import Supervisor from "./components/Supervisor/Supervisor";
import UserDashboard from "./components/Usercomponent/User";
import Userslist from "./components/Userslist/Userslist";
function App(){
       return(
        <>
        <Router>
              <div>
                     <Routes>
                            <Route path="/" exact element={<Login/>}/>
                            <Route  path="/:trip_id" exact element ={<Edittrips/>}/>
                            <Route path="/addtrips" exact element={<Addtripdetails/>}/>
                            <Route path="/adduser" exact element={<Adduser/>}/>
                            <Route path="/Dashboard"  exact element={<Dashhboard/>}/>
                            <Route path="/dashboardusersread" exact element={<Readonly/>}/>
                            <Route path="/supervisorlogin" exact element={<Supervisor/>}/>
                            <Route path="/userdashboard" exact element={<UserDashboard/>}/>
                            <Route path="/usersmanagement" exact element={<Userslist/>}/> 
                     </Routes>
              </div>
        </Router>
        </>
       )
}

export default App