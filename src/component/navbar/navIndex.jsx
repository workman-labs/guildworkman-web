import React from 'react';
import { styled } from '@mui/material/styles';
import style from './navIndex.module.css'
import {Button, Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";

const CustomButton2 = styled(Button)(({ theme }) => ({
    borderColor: '#5a97d9',
    color: '#fff',
    fontSize: '10px', // Adjust the font size as needed
    padding: '5px 10px',
    '&:hover': {
        borderColor: '#5887ef',
        color: '#fff',
    },
}));


const NavBar = () => {
    const navigate = useNavigate();
    return (
        <div className={style.nav}>
            <div className={style.navA}>
                <p >GuildWorkman</p>
            </div>

            <div className={style.nav2}>
                <p >Home</p>
                <p >Skills</p>
                <p >Clients</p>
            </div>

            <div className={style.btn1}>
                <Stack spacing={1} direction="row">
                    <CustomButton2 variant="contained" onClick={() => navigate('/login')}>Login</CustomButton2>
                    <CustomButton2 variant="contained" onClick={() => navigate('/skilWok')}>Sign up as skilledworker</CustomButton2>
                    <CustomButton2 variant="contained" onClick={() => navigate('/client')}>Sign up as client</CustomButton2>
                    <CustomButton2 variant="contained" onClick={() => navigate('/book')}>Book Appointment</CustomButton2>
                </Stack>
            </div>
        </div>
    );
};

export default NavBar;