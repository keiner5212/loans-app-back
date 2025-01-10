export enum Config {
    //tasa de interes
    INTEREST_RATE = "INTEREST_RATE",
    //maximo credito
    MAX_CREDIT_AMOUNT = "MAX_CREDIT_AMOUNT",
    //minimo credito
    MIN_CREDIT_AMOUNT = "MIN_CREDIT_AMOUNT",
    //frecuencia de alertas
    ALERT_FREQUENCY = "ALERT_FREQUENCY",
    //firma
    SIGNATURE = "SIGNATURE",
    //logo
    DOCUMENT_LOGO = "LOGO",
    //nombre en documentos
    DOCUMENT_NAME = "DOCUMENT_NAME",
    //numero de registro
    COMPANY_REGISTRATION = "COMPANY_REGISTRATION",
    //direccion
    COMPANY_ADDRESS = "COMPANY_ADDRESS",
    //telefono
    COMPANY_PHONE = "COMPANY_PHONE",
    //correo
    COMPANY_EMAIL = "COMPANY_EMAIL",
    //interes por atraso en dias
    DAILY_INTEREST_DELAY = "DAILY_INTEREST_DELAY",
}

export enum ExpressServerConfig {
    MAX_FILE_SIZE = 10 * 1024 * 1024, // 10MB
    STORAGE_PATH = "uploads",
}

export enum AlertFrequency {
    DAILY = "Daily",
    WEEKLY = "Weekly",
    MONTHLY = "Monthly",
}