import axiosInstance from '../utils/axios-customize';
import { getUser } from './userService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const resolveUserId = async () => {
    const localId = localStorage.getItem('user_id');
    if (localId) {
        return Number(localId);
    }

    const profileRes = await getUser();
    const profile = profileRes?.data || profileRes;
    const userId = Number(profile?.userId || profile?.UserID || 0);

    if (userId) {
        localStorage.setItem('user_id', String(userId));
        return userId;
    }

    throw new Error('Không lấy được thông tin user hiện tại');
};

export const getTeacherVocabularyLists = async () => {
    try {
        const userId = await resolveUserId();
        const response = await axiosInstance.get(`${BACKEND_URL}/vocabulary-list/getAllVocabularyListsByUserId/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi lấy danh sách từ vựng');
    }
};

export const getVocabularyListDetail = async (listId) => {
    try {
        const response = await axiosInstance.get(`${BACKEND_URL}/vocabulary-list/${listId}/vocabularies`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi lấy chi tiết danh sách từ vựng');
    }
};

export const deleteVocabularyList = async (listId) => {
    try {
        const response = await axiosInstance.delete(`${BACKEND_URL}/vocabulary-list/${listId}`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi xóa danh sách từ vựng');
    }
};

export const createVocabularyList = async (nameList, description) => {
    try {
        const response = await axiosInstance.post(`${BACKEND_URL}/vocabulary-list/add`, {
            nameList,
            description
        });
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi tạo danh sách từ vựng');
    }
};

export const addVocabularyToList = async (listId, payload) => {
    try {
        const response = await axiosInstance.post(`${BACKEND_URL}/vocabulary-list/${listId}/vocabularies`, payload);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi thêm từ vựng');
    }
};

export const updateVocabularyItem = async (vocabId, payload) => {
    try {
        const response = await axiosInstance.put(`${BACKEND_URL}/vocabulary-list/vocabularies/${vocabId}`, payload);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật từ vựng');
    }
};

export const deleteVocabularyItem = async (vocabId) => {
    try {
        const response = await axiosInstance.delete(`${BACKEND_URL}/vocabulary-list/vocabularies/${vocabId}`);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error?.message || 'Lỗi khi xóa từ vựng');
    }
};
