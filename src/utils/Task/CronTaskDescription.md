### **Flujo simplificado de la tarea de CronService**

#### **1. Obtener Créditos con Estado "RELEASED" o "LATE"**
   - Se consulta la base de datos para obtener todos los créditos cuyo estado sea `RELEASED` o `LATE`, los cuales están en seguimiento para la actualización del estado y pagos pendientes.

#### **2. Iterar sobre cada Crédito**
   - Para cada crédito encontrado, se realiza un análisis de su estado y pagos pendientes.
   - Se obtiene la fecha del último pago (`lastPaymentDate`). Si no existe, se usa la fecha de liberación del crédito (`releasedDate`).

#### **3. Calcular la Diferencia de Tiempo desde el Último Pago**
   - Se calcula la diferencia entre la fecha del último pago (o la fecha de liberación) y la fecha actual (`today`) usando la función `calculateTimeDiff`. El cálculo se realiza con base en el período del crédito (mensual, semanal, quincenal).

#### **4. Verificar y Actualizar el Estado del Crédito**
   - Si la diferencia de tiempo (`diffTime`) es mayor o igual a 1, y el estado del crédito no es `LATE`, se marca el crédito como atrasado (estado `LATE`).

#### **5. Actualizar el Estado de los Pagos Pendientes**
   - Se obtiene la lista de pagos pendientes para el crédito.
   - Para cada pago pendiente, se verifica si la fecha de pago (`timelyPayment`) es anterior a la fecha actual (`today`). Si es así, se marca el pago como atrasado (`LATE`).

#### **6. Calcular la Fecha del Próximo Pago**
   - Dependiendo de la diferencia de tiempo (`diffTime`), se determina la fecha del próximo pago:
     - Si hay pagos atrasados, se obtiene el último pago atrasado y se usa para calcular la fecha del siguiente pago.
     - Si no hay pagos atrasados, se usa la fecha del último pago como base para el cálculo.

#### **7. Verificar si Ya Existe un Pago Pendiente para el Próximo Período**
   - Se verifica si ya existe un pago pendiente para la fecha de pago calculada. Si ya existe, el flujo continúa con el siguiente crédito.

#### **8. Verificar la Existencia de Financiamiento**
   - Se consulta si existe un financiamiento asociado al crédito. Si lo hay, se obtiene el valor del pago inicial (down payment).

#### **9. Crear el Nuevo Pago Pendiente**
   - Si no existe un pago pendiente para el próximo periodo, se calcula el monto del pago utilizando la función `calcularPago`. Este cálculo toma en cuenta el monto solicitado, la tasa de interés, el pago inicial (si aplica) y el periodo del crédito.
   - Luego, se crea un nuevo pago con estado `PENDING` para el próximo período.
