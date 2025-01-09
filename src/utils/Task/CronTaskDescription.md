### **Flujo simplificado de la tarea de CronService**

#### 1. **Consulta inicial de créditos**
   - Se obtienen todos los créditos cuyo estado **no sea** `RELEASED` ni `LATE`:
     ```javascript
     const credits = await Credit.findAll({
         where: {
             status: {
                 [Op.notIn]: [Status.RELEASED, Status.LATE],
             },
         },
     });
     ```

#### 2. **Iteración sobre los créditos**
   - Por cada crédito:
   
   ##### **2.1. Calcular tiempo desde el último pago**
   - Calcula cuánto tiempo ha pasado desde la última fecha de pago o la fecha de liberación del crédito utilizando `calculateTimeDiff`.

   ##### **2.2. Actualizar estado del crédito si está atrasado**
   - Si ha pasado al menos un periodo desde el último pago y el estado del crédito no es `LATE`, se actualiza el estado del crédito a `LATE` y se guarda.

   ##### **2.3. Actualizar estado de los pagos pendientes**
   - Busca todos los pagos pendientes asociados al crédito:
     ```javascript
     const payments = await Payment.findAll({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });
     ```
   - Por cada pago pendiente, si la fecha de pago oportuno ya pasó, actualiza su estado a `LATE` y lo guarda.

   ##### **2.4. Determinar la fecha base para el próximo pago**
   - Si el crédito está atrasado:
     - **1 periodo atrasado:** Usa la última fecha de pago.
     - **Más de 1 periodo atrasado:** Busca el último pago marcado como `LATE` y usa su fecha como base. Si no hay pagos atrasados, usa la última fecha de pago.
   - Si el crédito **no está atrasado**, usa la última fecha de pago como base.

   ##### **2.5. Calcular la próxima fecha de pago**
   - Usa `calculateNextPaymentDate` para calcular la próxima fecha de pago a partir de la fecha base determinada en el paso anterior y el periodo del crédito.

   ##### **2.6. Crear un nuevo pago si es necesario**
   - Si la próxima fecha de pago calculada está en el futuro, no se crea un nuevo pago.
   - Si no, busca el financiamiento asociado al crédito para obtener el pago inicial (`downPayment`).
   - Calcula el monto del nuevo pago usando `calcularPago` y crea un nuevo pago pendiente con los datos calculados.
