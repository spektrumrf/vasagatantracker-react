import axios from 'axios';

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://vasagatantracker-node-production.up.railway.app/api/properties' : '/api/properties';

let token = null;

const setToken = (newToken) => {
    token = `bearer ${newToken}`;
};

const update = async (newObject, year) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year }
    };

    const response = await axios.put(baseUrl, newObject, config);
    return response.data;
};

export default { update, setToken };