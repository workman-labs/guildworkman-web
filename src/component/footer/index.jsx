import React from 'react';
import style from './index.module.css'

const Footer = () => {
    return (
        <>

            <footer className={style.fot}>
                <div>
                    <h1 className={style.fot1}>GuildWorkman</h1>
                    <p className={style.text}>Great platform to connect that
                        both Clients and Skilled workers<br/>to give them a happy ending</p>
                </div>
                <div>
                    <h1 className={style.fot2}>About</h1>
                    <p>Terms</p>
                    <p>Pricing</p>
                    <p>Advice</p>
                    <p>Privacy Policy</p>
                    <p>Clients</p>
                </div>
                <div>
                    <h1 className={style.fot3}>Resources</h1>
                    <p>Guide</p>
                    <p>Help Docs</p>
                    <p>Contact Us</p>
                    <p>Updates</p>
                </div>
                <div>
                    <h1 className={style.fot4}>Get job notifications</h1>
                    <p>The latest job news articles sent to your inbox everyday</p>
                </div>
            </footer>
        </>
);
};

export default Footer;