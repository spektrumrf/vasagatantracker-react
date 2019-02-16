import axios from 'axios';

const baseUrl = 'https://vasagatantracker-spektrumrf.herokuapp.com/api/login';

const login = async (credentials, year) => {
    const config = {
        params: { year }
    };
    const response = await axios.post(baseUrl, credentials, config);
    return response.data;
};

export default { login };