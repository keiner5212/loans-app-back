### **Flujo simplificado de la tarea de NotificationService**

#### **1. Obtener Información de la Empresa**
   - Se ejecuta la función `getCompanyInfo`, que consulta la base de datos para obtener todos los valores de configuración almacenados en la tabla `AppConfig`. Los valores se almacenan en un objeto clave-valor, donde cada clave corresponde a una configuración como el nombre de la empresa, dirección, teléfono, correo electrónico, etc.
     ```javascript
     const companyInfo = await getCompanyInfo();
     ```

#### **2. Recuperar Créditos con Estado "LATE"**
   - Se realiza una consulta para obtener todos los créditos cuyo estado sea `Status.LATE`, lo cual indica que están atrasados.
     ```javascript
     const credits = await Credit.findAll({ where: { status: Status.LATE } });
     ```
   - Por cada crédito encontrado, se pasa al siguiente paso.

#### **3. Obtener Información del Usuario**
   - Para cada crédito atrasado, se busca al usuario asociado utilizando el `userId` del crédito en la tabla `User`. Si el usuario existe, se procede con el envío de la notificación. Si no existe, el flujo continúa con el siguiente crédito.
     ```javascript
     const user = await User.findByPk(credit.userId);
     ```

#### **4. Obtener Pagos Pendientes**
   - Se realiza una consulta a la tabla `Payment` para obtener todos los pagos pendientes asociados al crédito. Estos pagos tienen el estado `PaymentStatus.PENDING`.
     ```javascript
     const pendingPayments = await Payment.findAll({
         where: { creditId: credit.id, status: PaymentStatus.PENDING },
     });
     ```
   - Luego, se genera un mensaje con los detalles de los pagos pendientes, formateando la información de cada pago (número de periodo, monto y fecha de pago).

#### **5. Componer el Mensaje de Notificación**
   - **Email**: Se compone un mensaje detallado que incluye el nombre del usuario, el ID del crédito, los detalles de los pagos pendientes, y la información de contacto de la empresa (teléfono, correo y dirección).
   - **WhatsApp**: Se genera un mensaje más breve con los mismos detalles para ser enviado por WhatsApp.
     ```javascript
     const emailMessage = `...`; // Detalles del mensaje por email
     const whatsappMessage = `...`; // Detalles del mensaje por WhatsApp
     ```

#### **6. Enviar Notificaciones**
   - **Correo Electrónico**: Utilizando el servicio de correo (`mailService`), se envía el mensaje compuesto por email al usuario.
     ```javascript
     await mailService.sendMail({
         from: mailService.fromDefault,
         to: user.email,
         subject: "Late Payment Notification",
         text: emailMessage,
     });
     ```
   - **WhatsApp**: Se utiliza el servicio de WhatsApp (`whatsAppService`) para enviar el mensaje compuesto al número de teléfono del usuario.
     ```javascript
     await whatsAppService.sendMessage({
         to: user.phone,
         message: whatsappMessage,
     });
     ```

#### **7. Pausa entre Notificaciones**
   - Para evitar el envío de notificaciones en masa de manera rápida, se introduce un retraso de 10 segundos entre el envío de cada notificación utilizando `setTimeout` en una promesa.
     ```javascript
     await new Promise((resolve) => setTimeout(resolve, 10000));
     ```
