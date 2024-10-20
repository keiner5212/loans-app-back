/* 
a) Usuario recuperación; será encargado de los cobros, emitir recibos, tener acceso a la reportería para gestionar los pagos.
b)	Usuario Colocación; será encargado de emitir las solicitudes previas, crear los contratos e ingresar los prestamos previo a su aprobación por el o los administradores.
c)	Usuario Administrador que tiene acceso a todo tipo, excepto a borrar la información y realizar los arqueos diarios de los efectivos recibidos
d)	Usuario Maestro: sin límites.
*/

export enum Roles {
    USER_RECOVERY = 'USER_RECOVERY',
    USER_COLLOCATION = 'USER_COLLOCATION',
    USER_ADMIN = 'USER_ADMIN',
    USER_MASTER = 'USER_MASTER',
}