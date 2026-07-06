import axios from "axios";

export const addSkillApi = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/skilledWorker/addSkill';
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

export const skillWorkerApi = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/skilledWorker/registerSkilledWorker';
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

export const loginApi = async (loginData) => {
    try {
        // Use the client login endpoint if this is for clients
        return await axios.post('https://guildworkman-api.onrender.com/api/v1/skilledWorker/login', loginData);
    } catch (error) {
        throw error;
    }
};


export const findById = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/skilledWorker/findById';
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

export const updateProfileApi = async (userData) => {
    const URL = 'https://guildworkman-api.onrender.com/api/v1/skilledWorker/updateProfile';
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