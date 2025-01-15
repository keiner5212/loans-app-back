/* 
Roles de usuario
a) Usuario recuperación; será encargado de los cobros, emitir recibos, tener acceso a la reportería para gestionar los pagos.
b)	Usuario Colocación; será encargado de emitir las solicitudes previas, crear los contratos e ingresar los prestamos previo a su aprobación por el o los administradores.
c)	Usuario Administrador que tiene acceso a todo tipo, excepto a borrar la información y realizar los arqueos diarios de los efectivos recibidos
d)	Usuario Maestro: sin límites.
e)	Usuario Cliente: no tieene derechos de acceso,solo representa a un usuario quepor ejemplo haya solicitado un prestamo.
*/

export enum Roles {
    USER_CLIENT = 'Cliente',
    USER_RECOVERY = 'Usuario Recuperación',
    USER_COLLOCATION = 'Usuario Colocación',
    USER_ADMIN = 'Usuario Administrador',
    USER_MASTER = 'Usuario Maestro',
}