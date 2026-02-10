import { guestInstance, authInstance } from './index.js'

export const createFeedback = async (payload) => {
    const { data } = await guestInstance.post('feedback/create', payload)
    return data
}

export const adminGetAllFeedback = async (status = 'all') => {
    const params = status && status !== 'all' ? {status} : {}
    const { data } = await authInstance.get('feedback/admin/getall', {params})
    return data
}

export const adminGetOneFeedback = async (id) => {
    const { data } = await authInstance.get(`feedback/admin/getone/${id}`)
    return data
}

export const adminMarkFeedbackRead = async (id) => {
    const { data } = await authInstance.patch(`feedback/admin/read/${id}`)
    return data
}

export const adminBlockFeedback = async (id) => {
    const { data } = await authInstance.patch(`feedback/admin/block/${id}`)
    return data
}

export const adminDeleteFeedback = async (id) => {
    const { data } = await authInstance.delete(`feedback/admin/delete/${id}`)
    return data
}
