import axios from 'axios';

export const loginApi = async (loginData, userType) => {
    const endpointMap = {
        client: 'https://guildworkman-api.onrender.com/api/v1/auth/login/client',
        worker: 'https://guildworkman-api.onrender.com/api/v1/auth/login/worker',
    };

    const apiEndpoint = endpointMap[userType] || endpointMap.client;


    try {
        return await axios.post(apiEndpoint, loginData);
    } catch (error) {
        throw error;
    }
};
