import Debug from 'debug';

Debug.enable('*,-express:router:route, -express:router,-puppeteer:*,-body-parser:json,-express:application,-sequelize:sql:pg,-express:router:layer,-queue,-sequelize:pool,-sequelize:connection:pg');

export function createDebugger(name: string) {
    return Debug(name);
}