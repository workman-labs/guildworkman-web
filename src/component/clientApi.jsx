import axios from "axios";
export const clientSignupApi = async (userData) => {
    console.log(userData);

    const URL = 'https://guildworkman-api.onrender.com/api/v1/client/registerClient';
    // const URL = 'http://localhost:8080/api/v1/client/registerClient';
    try {
        const response = await fetch(URL,  {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        console.log(JSON.stringify(userData));
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during skilled worker signup:', error.message);
        throw error;
    }
};
export const updateAppointmentApi = async (userData) => {
    console.log(userData);

    const URL = 'https://guildworkman-api.onrender.com/api/v1/client/updateAppointment';
    // const URL = 'http://localhost:8080/api/v1/client/updateAppointment';

    try {
        const response = await fetch(URL,  {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        console.log(JSON.stringify(userData));
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during client signup:', error.message);
        throw error;
    }
};

export const cancelAppointmentApi = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/client/cancelAppointment';
    // const URL = 'http://localhost:8080/api/v1/client/cancelAppointment';
    // const response = await fetch('https://guildworkman-api.onrender.com/api/v1/skilledWorker/cancelAppointment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(userData),
    // });
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'An error occurred');
    // }
    // return await response.json();

    try {
        const response = await fetch(URL,  {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        console.log(JSON.stringify(userData));
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during client signup:', error.message);
        throw error;
    }


};
export const loginApi = async (loginData) => {
    try {
        // return await axios.post('http://localhost:8080/api/v1/client/login', loginData);
        return await axios.post('https://guildworkman-api.onrender.com/api/v1/client/login', loginData);
    } catch (error) {
        throw error;
    }
};
export const bookingApi = async (userData) => {

    const URL = 'https://guildworkman-api.onrender.com/api/v1/client/bookAppointment'
    // const URL = 'http://localhost:8080/api/v1/client/bookAppointment';


    try {
        const response = await fetch(URL,  {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        console.log(JSON.stringify(userData));
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during client signup:', error.message);
        throw error;
    }
    // const response = await fetch('https://guildworkman-api.onrender.com/api/v1/client/bookAppointment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(userData),
    // });
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'An error occurred');
    // }
    // return await response.json();
};
export const viewAllAppointmentApi = async (clientId) => {
    const URL = `https://guildworkman-api.onrender.com/api/v1/client/viewAllAppointment?clientId=${clientId}`;
    // const URL = 'http://localhost:8080/api/v1/client/viewAllAppointment';
    try {
        const response = await fetch(URL,  {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },

        })
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during client signup:', error.message);
        throw error;
    }
    // const response = await fetch('https://guildworkman-api.onrender.com/api/v1/client/viewAllAppointment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(userData),
    // });
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'An error occurred');
    // }
    // return await response.json();
};
export const deleteAppointmentApi = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/client/deleteAppointment';

    try {
        const response = await fetch(URL,  {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        console.log(JSON.stringify(userData));
        console.log(response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error during client signup:', error.message);
        throw error;
    }
    // const response = await fetch('https://guildworkman-api.onrender.com/api/v1/client/deleteAppointment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(userData),
    // });
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'An error occurred');
    // }
    // return await response.json();
}