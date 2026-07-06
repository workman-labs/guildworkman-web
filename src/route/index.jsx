import ClientSignUp from "../pages/Dashbord/appoint/bookApp/clientrequests/clientregister/clientSignUp";
import ClientLogin from "../pages/LoginPg/clientLogin";
import Layout from "../component/layout";
import Home from "../pages/Home";
import MyDashboard from "../pages/Dashbord/dashboard/mydash";

import Appoint from "../pages/Dashbord/appoint/appoint";
import BookAppointment from "../pages/Dashbord/appoint/bookApp/bookappt";
import CancelAppointment from "../pages/Dashbord/appoint/bookApp/clientrequests/cancelApp/cancelApp";
import ViewAllAppointments from "../pages/Dashbord/appoint/bookApp/clientrequests/viewApp/viewApp";
import UpdateAppointment from "../pages/Dashbord/appoint/bookApp/clientrequests/updateApp/updateApp";
import WorkerProfiles from "../pages/Dashbord/catigory/imageCategory";
import AppointmentManager from "../pages/Dashbord/appointmanager/appointmentmanager";
import SkilledWorkerSignUp from "../pages/Dashbord/appoint/bookApp/workerrequests/skilledworkersignup/skilled";



export const ROUTE = [
    {
        path:"",
        element: <Layout/>,
        children:[
            {
                path: "",
                element:<Home/>
            }
        ]
    },
    // {
    //     path:"/jobs",
    //     element: <Layout/>,
    //     // children:[
    //     //     {
    //     //         path: "",
    //     //         element:<Jobs/>
    //     //     }
    //     // ]
    // },

    {
        path: "client",
        element:<ClientSignUp/>
    },
    {
        path: "skilWok",
        element:<SkilledWorkerSignUp/>
    },
    {
        path: "login",
        element:<ClientLogin/>
    },
    {
        path: "dashboard",
        element: <MyDashboard/>,
    },
    {
        path: "/appoint",
        element: <Appoint/>
    },
    {
        path: "book",
        element: <BookAppointment/>
    },
    {
        path: "cancel",
        element: <CancelAppointment/>
    },
    {
        path: "view",
        element: <ViewAllAppointments/>
    },
    {
        path: "/update",
        element: <UpdateAppointment/>
    },
    {
        path:"/book/:category",
        element: <WorkerProfiles/>

    },
    {
        path:"/appMan",
        element: <AppointmentManager/>
    },

]


