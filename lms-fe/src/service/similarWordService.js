import axios from "../utils/axios-customize";

const getSimilarWords = ({ word }) => {
    const URL_BACKEND = `ai-service/api/suggest?word=${word}`;
    return axios.get(URL_BACKEND);
};

export { getSimilarWords };