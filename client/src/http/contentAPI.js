import { guestInstance, authInstance } from './index.js'

export const fetchContactsContent = async () => {
    const { data } = await guestInstance.get('content/contacts')
    return data
}

export const updateContactsContent = async (payload) => {
    const { data } = await authInstance.put('content/contacts', payload)
    return data
}

export const fetchNavbarContent = async () => {
    const { data } = await guestInstance.get('content/navbar')
    return data
}

export const updateNavbarContent = async (payload) => {
    const { data } = await authInstance.put('content/navbar', payload)
    return data
}

export const fetchDeliveryContent = async () => {
    const { data } = await guestInstance.get('content/delivery')
    return data
}

export const updateDeliveryContent = async (payload) => {
    const { data } = await authInstance.put('content/delivery', payload)
    return data
}

export const fetchHomeContent = async () => {
    const { data } = await guestInstance.get('content/home')
    return data
}

export const updateHomeContent = async (payload) => {
    const { data } = await authInstance.put('content/home', payload)
    return data
}

export const deleteHomeContent = async () => {
    const { data } = await authInstance.delete('content/home')
    return data
}
