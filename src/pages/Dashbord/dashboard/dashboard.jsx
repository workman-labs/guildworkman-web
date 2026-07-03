import React from 'react';
import style from './index.module.css'
import {BiBookAlt, BiHelpCircle, BiHome, BiMessage, BiSolidReport, BiStats, BiTask} from "react-icons/bi";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div className={style.menu}>
            <div>off key</div>



            <div className={style.logo}>
                <BiBookAlt className={style.logoIcon}/>
                <h2>GuildWorkman</h2>

            </div>
            <div className={style.menuList}>
                <a href="#" className={style.item}>
                    <BiHome className={style.logoIcon}/>
                    Dashboard
                </a>
                <a href="#" className={style.item}>
                    <BiTask className={style.logoIcon} onClick={() => navigate('/appoint')}/>
                    Appointment

                </a>
                <a href="#" className={style.item}>
                    <BiSolidReport className={style.logoIcon} onClick={() => navigate('/update')}/>
                    My Profile
                </a>

                <a href="#" className={style.item}>
                    <BiStats className={style.logoIcon}/>
                    Login Details
                </a>

                <a href="#" className={style.item}>
                    <BiMessage className={style.logoIcon}/>
                    Message
                </a>

                <a href="#" className={style.item}>
                    <BiHelpCircle className={style.logoIcon}/>
                    Help
                </a>
            </div>
        </div>
    );
};

export default Dashboard;