import axios from '../utils/axios-customize'


const getUser = () => {
    const URL_BACKEND = '/auth/me';
    return axios.get(URL_BACKEND)
}

const updateUser = ({ name, gmail, phone }) => {
    const URL_BACKEND = '/auth/update';
    const data = {
        name,
        gmail,
        phone,
    };
    return axios.put(URL_BACKEND, data);
}

const changePassword = ({oldPassword, newPassword}) => {
    const URL_BACKEND = '/auth/change-password';
    const data = {
        oldPassword: oldPassword,
        newPassword: newPassword,
    };
    return axios.put(URL_BACKEND,data);
}

export {
    getUser, updateUser, changePassword
}