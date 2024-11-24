import dayjs from "dayjs";

export function parseDate(dateString: string) {
    const parts = dateString.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])); 
}
export function getDeltaTime(time: Date) {
    return new Date().getTime() - time.getTime();
}

export function getDateTime() {
    const now = new Date();
    const formattedDate = dayjs(now).format('YYYY-MM-DD HH:mm:ss');
    return formattedDate;
}


export function getDatetimeFromString(date: string) {
    const formattedDate = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    return formattedDate;
}