
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
import AddCarousals from "./components/Addcorousals/Addcorousals";
import Addreview from "./components/revies/Review";
import Cancellationpolicy from "./components/Cancellationpolicy/Cancellationpolicy";
import Pasttrips from "./components/Pasttrips/Passttrips";
import Supervisorpasttrips from "./components/Supervisor/Supervisorpasttrips/Supervisorpasttrips";
import UserpasttripsDashboard from "./components/Usercomponent/Userpasttrips/Userpasttrips";
import Readonlypastrips from "./components/readonlylogin/Readonlypasttrip";
import CouponForm from "./components/Coupon/Couponedit";
import AddCouponForm from "./components/Coupon/Coupon";
import EditUser from "./components/Userslist/Edituser";
import EditPolicies from "./components/Cancellationpolicy/Editcancellationpolicies";
import ForgotPassword from "./components/Forgotpassword/Forgotpassword";
import VerifyOTP from "./components/Verifyotp/Verifyotp";
import NewPasswordComponent from "./components/Newpasswordcomponent/Newpasswordcomponent.";
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
                            <Route path="/addcarousals" exact element={<AddCarousals/>} />
                            <Route path="/addreview" exact element={<Addreview/>}/>
                            <Route path="/cancellationpolicy" exact element={<Cancellationpolicy/>}/>
                            <Route path="/pasttrips" exact element={<Pasttrips/>}/>
                            <Route path="/supervisorpasttrips"  exact element={<Supervisorpasttrips/>}/>
                            <Route path="userpasttrips" exact element={<UserpasttripsDashboard/>}/>
                            <Route path="/readonlypasttrips" exact element={<Readonlypastrips/>}/>
                            <Route path="discountcoupon" exact element={<CouponForm/>}/>
                            <Route path="add-coupon" exact element={<AddCouponForm/>}/>
                            <Route path="/edituser/:userId" exact element={<EditUser />} />
                            <Route path="/editpolicies/:policyId" exact element={<EditPolicies/>} />
                            <Route path="/forgot-password" exact element={<ForgotPassword/>}/>
                            <Route path="/verify-otp" exact element={<VerifyOTP/>}/>
                            <Route path="/createnewpassword" exact  element={<NewPasswordComponent/>}/>
                     </Routes>
              </div>
        </Router>
        </>
       )
}

export default App