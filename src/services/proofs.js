import axios from 'axios';

const baseUrl = 'https://vasagatantracker-spektrumrf.herokuapp.com/api/proofs';

let token = null;

const setToken = (newToken) => {
    token = `bearer ${newToken}`;
};

const get = (id, year) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year }
    };
    const request = axios.get(`${baseUrl}/${id}`, config);
    return request.then(response => response.data);
};

const getAll = (year) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year }
    };
    const request = axios.get(baseUrl, config);
    return request.then(response => response.data);
};

const create = async (newObject, year) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year }
    };

    const response = await axios.post(baseUrl, newObject, config);
    return response.data;
};

const update = (id, newObject, year, type) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year, type }
    };

    const request = axios.put(`${baseUrl}/${id}`, newObject, config);
    return request.then(response => response.data);
};

const remove = (id, year) => {
    const config = {
        headers: { 'Authorization': token },
        params: { year }
    };
    const request = axios.delete(`${baseUrl}/${id}`, config);
    return request.then(response => response.data);
};

export default { get, getAll, create, update, remove, setToken };