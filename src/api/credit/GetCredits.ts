import axiosInstance from "../axiosInstance";

export async function GetCredits(): Promise<any | undefined> {
    try {
        const response = await axiosInstance.get('/api/v1/credit/');
        return response.data
    } catch (error: any) {
        console.error('Error obteniendo las solicitudes:', error.response?.data || error.message);
    }
}

export async function GetCredit(id: number): Promise<any | undefined> {
    try {
        const response = await axiosInstance.get('/api/v1/credit/' + id);
        return response.data
    } catch (error: any) {
        console.error('Error obteniendo la solicitud:', error.response?.data || error.message);
    }
}

export async function GetCreditContractInfo(id: number): Promise<any | undefined> {
    try {
        const response = await axiosInstance.get('/api/v1/credit/contract/' + id);
        return response.data
    } catch (error: any) {
        console.error('Error obteniendo la solicitud:', error.response?.data || error.message);
    }
}

//get late credits
export async function GetLateCredits(): Promise<any | undefined> {
    try {
        const response = await axiosInstance.get('/api/v1/credit/late/');
        return response.data
    } catch (error: any) {
        console.error('Error obteniendo las solicitudes:', error.response?.data || error.message);
    }
}

//get credits by user
export async function GetCreditsByUser(userId: string): Promise<any | undefined> {
    try {
        const response = await axiosInstance.get('/api/v1/credit/user/' + userId);
        return response.data
    } catch (error: any) {
        console.error('Error obteniendo las solicitudes:', error.response?.data || error.message);
    }
}