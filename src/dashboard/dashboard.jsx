 import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import styles from "./index.module.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

const ProfileLayout = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [profileImage, setProfileImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(false);

    const onDrop = (acceptedFiles) => {
        setProfileImage(URL.createObjectURL(acceptedFiles[0]));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        maxFiles: 1
    });

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        console.log("Uploaded Image:", profileImage);

        setSuccessMessage(true);

        setTimeout(() => {
            setSuccessMessage(false);
        }, 3000);
    };

    return (
        <div className={styles.profileContainer}>
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>GuildWorkman</h2>
                <nav>
                    <ul className={styles.navList}>
                        <li className={`${styles.navItem}`}>
                            <i className="fas fa-home"></i> Dashboard
                        </li>
                        <li className={`${styles.navItem}`}>
                            <i className="fas fa-calendar-alt"></i> Appointment
                        </li>
                        <li className={`${styles.navItem} ${styles.active}`}>
                            <i className="fas fa-user"></i> My Profile
                        </li>
                        <li className={`${styles.navItem}`}>
                            <i className="fas fa-lock"></i> Login Details
                        </li>
                        <li className={`${styles.navItem}`}>
                            <i className="fas fa-envelope"></i> Message
                        </li>
                        <li className={`${styles.navItem}`}>
                            <i className="fas fa-question-circle"></i> Help
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                <h1 className={styles.sectionTitle}>Profile Information</h1>
                <p className={styles.sectionDescription}>Update your personal information below.</p>

                {successMessage && <p className={styles.successMessage}>Saved successfully!</p>}

                <div className={styles.profileCard}>
                    <div {...getRootProps()} className={styles.profilePhoto}>
                        <input {...getInputProps()} />
                        {
                            profileImage ? (
                                <img src={profileImage} alt="Profile" className={styles.uploadedImage} />
                            ) : isDragActive ? (
                                <p>Drop the image here ...</p>
                            ) : (
                                <p>Click to upload or drag and drop<br />SVG, PNG, JPG or GIF (max 400 x 400px)</p>
                            )
                        }
                    </div>
                    <form className={styles.profileForm} onSubmit={handleSubmit(onSubmit)}>
                        <label>Full Name *</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            {...register('fullName', { required: "Full name is required" })}
                        />
                        {errors.fullName && <p className={styles.error}>{errors.fullName.message}</p>}

                        <label>Phone Number</label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            {...register('phoneNumber', { pattern: /^[0-9]+$/ })}
                        />
                        {errors.phoneNumber && <p className={styles.error}>Invalid phone number</p>}

                        <label>Email *</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            {...register('email', { required: "Email is required" })}
                        />
                        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

                        <label>Date of Birth</label>
                        <input type="date" {...register('dob')} />

                        <label>Gender</label>
                        <select {...register('gender')}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>

                        <label>Account Type</label>
                        <select {...register('accountType')}>
                            <option value="skilled-worker">Skilled Worker</option>
                            <option value="client">Client</option>
                        </select>

                        <button type="submit" className={styles.submitButton}>Save Changes</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ProfileLayout;
