import axios from 'axios';

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://vasagatantracker-spektrumrf.herokuapp.com/api/login' : '/api/login'

const login = async (credentials, year) => {
    const config = {
        params: { year }
    };
    const response = await axios.post(baseUrl, credentials, config);
    return response.data;
};

export default { login };