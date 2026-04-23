import axios from '../utils/axios-customize'

const addWord = ({ listId, word, description, wordType, pronounce, example, status }) => {
    const URL_BACKEND = `/vocabulary-list/${listId}/vocabularies`;
    const data = {
        vocab: word,
        mean: description,
        wordType: wordType,
        pronunciation: pronounce,
        example: example,
        status: status,
    };
    return axios.post(URL_BACKEND, data);
    
}
const getNote = () => {
    const URL_BACKEND = '/vocabulary-list/my-vocab';
    return axios.get(URL_BACKEND);
}

const updateWord = ({wordId, word, description, wordType, pronounce, example, status}) => {
    const URL_BACKEND = `/vocabulary-list/vocabularies/${wordId}`
    const data = {
        vocab: word,
        mean: description,
        wordType: wordType,
        pronunciation: pronounce,
        example: example,
        status: status,
    };
    return axios.put(URL_BACKEND,data)
}
const deleteWord = ({wordId}) => {
    const URL_BACKEND = `/vocabulary-list/vocabularies/${wordId}`
    return axios.delete(URL_BACKEND)
}


export {
    addWord, getNote, updateWord, deleteWord
}