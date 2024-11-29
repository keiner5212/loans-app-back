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
    SIGNATURE = "SIGNATURE"
}

export enum ExpressServerConfig {
    MAX_FILE_SIZE = 10 * 1024 * 1024, // 10MB
    STORAGE_PATH = "uploads",
}