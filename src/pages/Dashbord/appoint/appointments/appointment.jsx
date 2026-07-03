import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import banner from '../../../../assets/logobanna.png'
import fashionDesigner from '../../../../assets/fashiondesigner.jpg'
import brickLayers from '../../../../assets/mernsonMen.jpg'
import plumber from '../../../../assets/plumb2.jpeg'
import hairStylist from '../../../../assets/hairstylist.jpg'
import workers from '../../../../assets/foundationLayers.jpg'
import styles from './index.module.css';



const AppointmentComponent = () => {
    const [isClient, setIsClient] = useState(true);

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="appointment-container">
            <div className={styles.scrollWatcher}></div>
            <h1 className={styles.logoH1}>GuildWorkman</h1>
            <h2>{isClient ? 'Client Appointment' : 'Skilled Worker Appointment'}</h2>
            <img className={styles.bannerImage} src={banner} alt={''} />
            <div className="appointment-actions">
                {isClient ? (
                    <>
                        <button onClick={() => handleNavigation('/book')}>Book Appointment</button>
                        <button onClick={() => handleNavigation('/cancel')}>Cancel Appointment</button>
                        <button onClick={() => handleNavigation('/update')}>Update Appointment</button>
                        <button onClick={() => handleNavigation('/delete')}>Delete Appointment</button>
                        <button onClick={() => handleNavigation('/view')}>View All Appointments</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleNavigation('/accept')}>Accept Appointment</button>
                        <button onClick={() => handleNavigation('/decline')}>Decline Appointment</button>
                        <button onClick={() => handleNavigation('/delete')}>Delete Appointment</button>
                        <button onClick={() => handleNavigation('/view')}>View All Appointments</button>
                    </>
                )}
            </div>
            <div className={styles.mainBody}>

                <div className={styles.leftTexted}>
                    <div>
                        <h3>Book Appointment</h3>
                        <p>Book appointments easily and reliably</p>
                        <button onClick={() => handleNavigation('/book')}>Book Appointment</button>
                    </div>
                    <img src={fashionDesigner} alt={''}/>
                </div>

                <div className={styles.rightTexted}>
                    <img src={brickLayers} alt={''}/>
                    <div>
                        <h3>Cancel Appointment</h3>
                        <p>Book appointments easily and reliably</p>
                        <button onClick={() => handleNavigation('/cancel')}>Cancel Appointment</button>
                    </div>
                </div>

                <div className={styles.leftTexted}>
                    <div>
                        <h3>Update Appointment</h3>
                        <p>Book appointments easily and reliably</p>
                        <button onClick={() => handleNavigation('/update')}>Update Appointment</button>
                    </div>
                    <img src={hairStylist} alt={''}/>
                </div>

                <div className={styles.rightTexted}>
                    <img src={plumber} alt={''}/>
                    <div>
                        <h3>Delete Appointment</h3>
                        <p>Book appointments easily and reliably</p>
                        <button onClick={() => handleNavigation('/delete')}>Delete Appointment</button>
                    </div>
                </div>

                <div className={styles.leftTexted}>
                    <div>
                        <h3>View all Appointment</h3>
                        <p>Book appointments easily and reliably</p>
                        <button onClick={() => handleNavigation('/view')}>View All Appointments</button>
                    </div>
                    <img src={workers} alt={''}/>
                </div>
            </div>
        </div>
    );
};

export default AppointmentComponent;

