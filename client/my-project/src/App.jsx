
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, } from 'react-router-dom';

import Dashhboard from "./components/Dashboard/Dashboard";
import  Edittrips from './components/Editcomponent/Edittrips'
import Addtripdetails from "./components/Addtrip/Addtrip";
function App(){
       return(
        <>
        <Router>
              <div>
                     <Routes>
                            <Route path="/" exact element={<Dashhboard/>}/>
                            <Route  path="/edittrips" exact element ={<Edittrips/>}/>
                            <Route path="/addtrips" exact element={<Addtripdetails/>}/>
                            
                     </Routes>
              </div>
        </Router>
        </>
       )
}

export default App