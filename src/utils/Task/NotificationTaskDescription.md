### **Flujo simplificado de la tarea de NotificationService**

#### **1. Obtener Información de Configuración**
   - Recuperar los valores clave de configuración de la empresa, como el nombre, teléfono y correo electrónico. Estos datos se incluirán en las notificaciones para proporcionar información de contacto.

#### **2. Notificar Créditos con Estado "LATE"**
   - **Obtener Créditos**: Identificar todos los créditos cuyo estado sea `LATE`.
   - **Procesar Créditos**:
     1. Consultar el usuario asociado a cada crédito.
     2. Obtener la lista de pagos atrasados vinculados a dicho crédito.
     3. Crear mensajes personalizados para notificar al usuario sobre los pagos atrasados, tanto en formato detallado (para correo electrónico) como resumido (para WhatsApp).
   - **Enviar Notificaciones**:
     - Enviar notificaciones por correo electrónico y WhatsApp a los usuarios con créditos atrasados.
     - Implementar una pausa breve entre cada notificación para evitar saturación del sistema.

#### **3. Notificar Próximos Pagos de Créditos Activos (`Status.RELEASED`)**
   - **Obtener Créditos**: Identificar todos los créditos cuyo estado sea `RELEASED`.
   - **Procesar Créditos**:
     1. Consultar el usuario asociado a cada crédito.
     2. Identificar los pagos próximos a vencer en los próximos 2 días.
     3. Generar mensajes personalizados recordando los pagos futuros, utilizando un formato adecuado para correo y WhatsApp.
   - **Enviar Notificaciones**:
     - Enviar recordatorios por correo electrónico y WhatsApp a los usuarios con pagos próximos a vencer.
     - Implementar una pausa breve entre cada notificación para mantener el sistema estable.

#### **4. Gestión de Pausas**
   - Implementar pausas de tiempo predefinido entre cada notificación enviada, tanto en el caso de pagos atrasados como en los recordatorios de próximos pagos, para evitar sobrecargas en los servicios de envío.
