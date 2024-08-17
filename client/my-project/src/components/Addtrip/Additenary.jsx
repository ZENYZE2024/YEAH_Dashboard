// import React, { useState } from "react";

// function Additenary() {
//     const [DAY, setDAY] = useState();
//     const [DATE, setDATE] = useState();
//     const [DAY_TITLE, setDAY_TITLE] = useState();
//     const [DAY_DESCRIPTION, setDAY_DESCRIPTION] = useState();
//     return (
//         <>
//             <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-500">

//                 <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
//                     <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Add Itenary</h1>
//                     <form >

//                         <input
//                             type="text"
//                             placeholder="Day Number"
//                             className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
//                             value={DAY}
//                             onChange={(e) => setDAY(e.target.value)}
//                         />

//                         <input
//                             type="text"
//                             placeholder="Day Number"
//                             className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
//                             value={DATE}
//                             onChange={(e) => setDATE(e.target.value)}
//                         />

//                         <input
//                             type="text"
//                             placeholder="Day Number"
//                             className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
//                             value={DAY_TITLE}
//                             onChange={(e) => setDAY_TITLE(e.target.value)}
//                         />

//                         <input
//                             type="text"
//                             placeholder="Day Number"
//                             className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
//                             value={DAY_DESCRIPTION}
//                             onChange={(e) => setDAY_DESCRIPTION(e.target.value)}
//                         />

//                     </form>

//                 </div>

//             </div>
//         </>
//     )
// }

// export default Additenary;