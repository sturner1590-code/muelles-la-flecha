# Documento de Requisitos Funcionales
## Aplicación de Administración de Taller Automotriz
**Versión:** 1.0  
**Fecha:** 2026-04-09  
**Autor:** Equipo de Producto

---

## 1. Resumen Ejecutivo

Sistema integral para la gestión del ciclo de vida completo del servicio automotriz. Cubre desde la recepción del vehículo hasta la entrega al cliente, incluyendo diagnóstico digital, control de inventario, facturación y comunicación automatizada.

---

## 2. Modelo de Datos

### 2.1 Entidades Principales

#### `Customer` (Cliente)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `full_name` | string | Nombre completo |
| `phone` | string | Teléfono (para SMS) |
| `email` | string | Correo electrónico |
| `created_at` | timestamp | Fecha de registro |

#### `Vehicle` (Vehículo)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `customer_id` | FK → Customer | Propietario |
| `vin` | string | Número de serie (VIN) |
| `plate` | string | Número de placa |
| `make` | string | Marca (Toyota, Ford…) |
| `model` | string | Modelo |
| `year` | integer | Año |
| `mileage` | integer | Kilometraje actual |
| `color` | string | Color |

#### `WorkOrder` (Orden de Trabajo)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `vehicle_id` | FK → Vehicle | Vehículo en servicio |
| `customer_id` | FK → Customer | Cliente asociado |
| `technician_id` | FK → User | Técnico asignado |
| `status` | enum | `received`, `diagnosing`, `waiting_parts`, `in_progress`, `completed`, `delivered` |
| `priority` | enum | `low`, `normal`, `high`, `urgent` |
| `estimated_delivery` | timestamp | Fecha/hora estimada de entrega |
| `labor_cost` | decimal | Costo de mano de obra |
| `parts_cost` | decimal | Costo de refacciones (calculado) |
| `total_cost` | decimal | Total de la orden |
| `created_at` | timestamp | Fecha de apertura |
| `closed_at` | timestamp | Fecha de cierre |
| `notes` | text | Notas internas |

#### `ServiceItem` (Servicio en la Orden)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `work_order_id` | FK → WorkOrder | Orden de trabajo |
| `description` | string | Descripción del servicio |
| `estimated_hours` | decimal | Horas estimadas |
| `actual_hours` | decimal | Horas reales registradas |
| `rate_per_hour` | decimal | Tarifa por hora |

#### `TimeLog` (Registro de Tiempo del Técnico)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `work_order_id` | FK → WorkOrder | Orden de trabajo |
| `technician_id` | FK → User | Técnico |
| `service_item_id` | FK → ServiceItem | Tarea específica |
| `started_at` | timestamp | Inicio del trabajo |
| `ended_at` | timestamp | Fin del trabajo |
| `minutes_worked` | integer | Minutos trabajados (calculado) |
| `notes` | text | Observaciones del técnico |

#### `DVI` (Inspección Digital del Vehículo)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `work_order_id` | FK → WorkOrder | Orden de trabajo |
| `created_by` | FK → User | Técnico que realizó la inspección |
| `overall_condition` | enum | `good`, `fair`, `poor` |
| `created_at` | timestamp | Fecha de inspección |

#### `DVIItem` (Ítem de Inspección)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `dvi_id` | FK → DVI | Inspección padre |
| `area` | string | Área del vehículo (frenos, motor, carrocería…) |
| `condition` | enum | `ok`, `attention`, `critical` |
| `description` | text | Descripción del hallazgo |

#### `DVIPhoto` (Foto de Inspección)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `dvi_item_id` | FK → DVIItem | Ítem de inspección |
| `url` | string | URL del archivo en almacenamiento |
| `annotation_data` | JSON | Datos de anotaciones (coordenadas, texto, flechas) |
| `uploaded_at` | timestamp | Fecha de subida |

#### `Part` (Refacción / Producto)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `sku` | string | Código SKU / código de barras |
| `name` | string | Nombre de la refacción |
| `category` | string | Categoría (frenos, aceites, filtros…) |
| `unit` | string | Unidad de medida (pieza, litro, set) |
| `cost_price` | decimal | Precio de costo |
| `sale_price` | decimal | Precio de venta |
| `stock` | integer | Existencia actual |
| `min_stock` | integer | Nivel mínimo para alerta de reorden |
| `supplier_id` | FK → Supplier | Proveedor principal |
| `location` | string | Ubicación en almacén |

#### `Supplier` (Proveedor)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | string | Nombre del proveedor |
| `contact_name` | string | Nombre del contacto |
| `phone` | string | Teléfono |
| `email` | string | Correo |

#### `WorkOrderPart` (Refacción Usada en Orden)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `work_order_id` | FK → WorkOrder | Orden de trabajo |
| `part_id` | FK → Part | Refacción utilizada |
| `quantity` | integer | Cantidad usada |
| `unit_price` | decimal | Precio al momento del uso |
| `added_by` | FK → User | Técnico que la registró |
| `added_at` | timestamp | Fecha de uso |

#### `Appointment` (Cita)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `customer_id` | FK → Customer | Cliente |
| `vehicle_id` | FK → Vehicle | Vehículo |
| `technician_id` | FK → User | Técnico asignado (opcional) |
| `scheduled_at` | timestamp | Fecha y hora de la cita |
| `service_type` | string | Tipo de servicio solicitado |
| `status` | enum | `scheduled`, `confirmed`, `arrived`, `no_show`, `cancelled` |
| `reminder_sent` | boolean | Si se envió recordatorio por SMS |

#### `Message` (Mensaje / Notificación)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `customer_id` | FK → Customer | Destinatario |
| `work_order_id` | FK → WorkOrder | Orden relacionada (opcional) |
| `channel` | enum | `sms`, `email`, `push` |
| `type` | enum | `appointment_reminder`, `status_update`, `ready_pickup`, `invoice`, `custom` |
| `body` | text | Contenido del mensaje |
| `status` | enum | `pending`, `sent`, `delivered`, `failed` |
| `sent_at` | timestamp | Fecha de envío |

#### `Invoice` (Factura)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `work_order_id` | FK → WorkOrder | Orden de trabajo |
| `folio` | string | Número de folio |
| `subtotal` | decimal | Subtotal antes de impuestos |
| `tax` | decimal | Impuesto (IVA) |
| `total` | decimal | Total a pagar |
| `payment_method` | enum | `cash`, `card`, `transfer`, `credit` |
| `payment_status` | enum | `pending`, `partial`, `paid` |
| `issued_at` | timestamp | Fecha de emisión |

#### `User` (Usuario del Sistema)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `name` | string | Nombre completo |
| `email` | string | Correo de acceso |
| `password_hash` | string | Contraseña hasheada |
| `role` | enum | Ver sección de roles |
| `is_active` | boolean | Estado de la cuenta |
| `pin` | string | PIN de 4 dígitos (portal mecánico) |

---

### 2.2 Diagrama de Relaciones (texto)

```
Customer ──< Vehicle ──< WorkOrder >── Technician (User)
                            │
                   ┌────────┼────────────┐
                   │        │            │
                  DVI   ServiceItem  WorkOrderPart
                   │        │            │
               DVIItem   TimeLog       Part
                   │                    │
               DVIPhoto              Supplier

WorkOrder ──< Appointment
WorkOrder ──> Invoice
WorkOrder ──< Message (via customer_id)
```

---

## 3. Roles de Usuario

| Rol | Código | Descripción |
|---|---|---|
| **Administrador** | `admin` | Acceso total al sistema. Configura usuarios, precios, reportes financieros y ajustes del taller. |
| **Recepcionista** | `receptionist` | Abre órdenes de trabajo, gestiona citas, se comunica con clientes, emite facturas. No ve reportes financieros globales. |
| **Técnico** | `technician` | Accede al portal del mecánico. Registra tiempo y refacciones. Sube fotos de DVI. Acceso restringido solo a sus órdenes activas. |
| **Encargado de Almacén** | `parts_manager` | Gestión completa de inventario, recepción de pedidos y ajustes de stock. Sin acceso a facturación. |
| **Gerente** | `manager` | Reportes financieros y de desempeño. Puede editar órdenes y ver todo el sistema, pero no modifica configuración. |

### 3.1 Matriz de Permisos por Módulo

| Módulo | Admin | Manager | Receptionist | Technician | Parts Manager |
|---|:---:|:---:|:---:|:---:|:---:|
| Panel de administración (financiero) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Panel (cargas de trabajo) | ✅ | ✅ | ✅ | Solo propio | ❌ |
| Órdenes de trabajo | CRUD | CRUD | CRUD | Solo lectura + tiempo | ❌ |
| DVI — ver | ✅ | ✅ | ✅ | ✅ | ❌ |
| DVI — crear/editar | ✅ | ✅ | ✅ | Solo asignadas | ❌ |
| Mensajería | ✅ | ✅ | ✅ | ❌ | ❌ |
| Inventario — ver | ✅ | ✅ | ✅ | Solo consulta | ✅ |
| Inventario — CRUD | ✅ | ❌ | ❌ | ❌ | ✅ |
| POS / Facturación | ✅ | Ver | ✅ | ❌ | ❌ |
| Reportes | ✅ | ✅ | Limitado | ❌ | Inventario |
| Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Requisitos Funcionales por Módulo

### 4.1 Panel de Administración

**RF-ADM-01** El panel muestra en tiempo real:
- Ingresos del día (facturas cobradas)
- Número de órdenes activas por estado
- Carga de trabajo por técnico (órdenes asignadas / horas estimadas)
- Alertas de stock mínimo de refacciones

**RF-ADM-02** Gráficas semanales/mensuales de ingresos, órdenes completadas y tiempo promedio de servicio.

**RF-ADM-03** Widget de citas del día con opción de convertir en orden de trabajo con un clic.

---

### 4.2 Inspección Digital del Vehículo (DVI)

**RF-DVI-01** Al abrir una orden, el técnico o recepcionista inicia un DVI estructurado por áreas predefinidas (motor, frenos, suspensión, carrocería, interior, llantas, luces).

**RF-DVI-02** Cada ítem tiene selector de condición (Verde / Amarillo / Rojo) y campo de descripción libre.

**RF-DVI-03** El técnico puede subir hasta 10 fotos por ítem de inspección desde la cámara del dispositivo o galería.

**RF-DVI-04** Las fotos admiten anotaciones: flechas, círculos y texto superpuesto para señalar daños específicos.

**RF-DVI-05** El DVI se puede compartir con el cliente como URL pública de solo lectura vía SMS o email.

**RF-DVI-06** El sistema guarda historial de DVIs anteriores del vehículo para comparación.

---

### 4.3 Mensajería con Clientes

**RF-MSG-01** Recordatorio automático por SMS 24 horas antes de la cita.

**RF-MSG-02** Recordatorio adicional 2 horas antes de la cita.

**RF-MSG-03** Notificación automática por SMS cuando la orden cambia de estado (especialmente a `completed` → "Tu auto está listo para recoger en [taller]").

**RF-MSG-04** Plantillas de mensajes configurables con variables: `{{customer_name}}`, `{{vehicle}}`, `{{appointment_time}}`, `{{work_order_id}}`, `{{total_cost}}`.

**RF-MSG-05** La recepcionista puede enviar mensajes manuales desde la vista de la orden.

**RF-MSG-06** Registro completo del historial de mensajes enviados por orden y cliente.

**RF-MSG-07** Integración con proveedor SMS (Twilio / Vonage) configurable desde el panel de administración.

---

### 4.4 Inventario de Refacciones y POS

**RF-INV-01** Catálogo de refacciones con búsqueda por nombre, SKU o código de barras.

**RF-INV-02** Al agregar una refacción a una orden de trabajo, el stock se descuenta automáticamente.

**RF-INV-03** Si el stock de una refacción cae por debajo de `min_stock`, se genera una alerta visible en el panel del encargado de almacén.

**RF-INV-04** El POS permite crear ventas directas (mostrador) sin necesidad de una orden de trabajo.

**RF-INV-05** La factura de la orden incluye el desglose de refacciones usadas y mano de obra.

**RF-INV-06** Reportes de movimientos de inventario filtrable por fecha, categoría y refacción.

**RF-INV-07** Opción de revertir el descuento de stock si una refacción es devuelta a almacén desde una orden.

---

### 4.5 Portal del Mecánico

**RF-MEC-01** Interfaz simplificada accesible desde tablet o smartphone, autenticación por PIN de 4 dígitos.

**RF-MEC-02** El técnico ve solo las órdenes que le están asignadas, ordenadas por prioridad.

**RF-MEC-03** Función de "fichar" (start/stop) para registrar tiempo en cada tarea de la orden.

**RF-MEC-04** El técnico puede buscar y agregar refacciones a la orden desde el inventario.

**RF-MEC-05** El técnico puede subir fotos y crear ítems de DVI desde el portal.

**RF-MEC-06** Campo de notas para registrar observaciones técnicas en la orden.

**RF-MEC-07** Al marcar una tarea como completada, el sistema notifica al recepcionista.

---

## 5. Requisitos de Endpoints de API

### 5.1 Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Login con email + password, retorna JWT |
| `POST` | `/api/auth/pin-login` | Login de técnico con PIN (retorna JWT de scope limitado) |
| `POST` | `/api/auth/refresh` | Renovar token JWT |
| `POST` | `/api/auth/logout` | Invalidar token |

---

### 5.2 Inventario y Escaneo

Estos endpoints son críticos para la operación de almacén y el portal del mecánico con lector de código de barras.

#### Búsqueda y Consulta

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/parts` | Listar refacciones con filtros: `?search=`, `?category=`, `?low_stock=true` |
| `GET` | `/api/parts/:id` | Detalle de una refacción |
| `GET` | `/api/parts/scan/:sku` | **Buscar por código de barras/SKU** — núcleo del flujo de escaneo |
| `GET` | `/api/parts/categories` | Listado de categorías disponibles |

**Flujo de escaneo en portal del mecánico:**
```
Escanear código de barras
        │
        ▼
GET /api/parts/scan/{sku}
        │
   ┌────┴────┐
   │Encontrado│
   └────┬────┘
        ▼
Mostrar nombre, precio, stock disponible
        │
        ▼
POST /api/work-orders/{id}/parts
  { part_id, quantity }
        │
        ▼
Sistema descuenta stock automáticamente
```

#### Gestión de Inventario

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/parts` | Crear refacción (Parts Manager / Admin) |
| `PUT` | `/api/parts/:id` | Actualizar refacción |
| `DELETE` | `/api/parts/:id` | Eliminar refacción (solo si sin movimientos) |
| `POST` | `/api/parts/:id/adjust-stock` | Ajuste manual de stock con motivo (`{ quantity_delta, reason }`) |
| `GET` | `/api/parts/:id/movements` | Historial de movimientos de una refacción |

---

### 5.3 Órdenes de Trabajo

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/work-orders` | Listar con filtros: `?status=`, `?technician_id=`, `?date_from=`, `?date_to=` |
| `POST` | `/api/work-orders` | Crear orden de trabajo |
| `GET` | `/api/work-orders/:id` | Detalle completo de la orden |
| `PUT` | `/api/work-orders/:id` | Actualizar orden |
| `PATCH` | `/api/work-orders/:id/status` | Cambiar estado (`{ status }`) |
| `POST` | `/api/work-orders/:id/parts` | Agregar refacción a la orden (descuenta stock) |
| `DELETE` | `/api/work-orders/:id/parts/:part_id` | Devolver refacción al inventario |
| `GET` | `/api/work-orders/:id/parts` | Listado de refacciones de la orden |
| `POST` | `/api/work-orders/:id/time-logs` | Registrar tiempo trabajado |
| `GET` | `/api/work-orders/:id/time-logs` | Ver registros de tiempo de la orden |

---

### 5.4 DVI

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/work-orders/:id/dvi` | Crear DVI para una orden |
| `GET` | `/api/work-orders/:id/dvi` | Obtener DVI activo de la orden |
| `PUT` | `/api/dvi/:id` | Actualizar DVI |
| `POST` | `/api/dvi/:id/items` | Agregar ítem de inspección |
| `PUT` | `/api/dvi/items/:item_id` | Actualizar ítem |
| `POST` | `/api/dvi/items/:item_id/photos` | Subir foto con anotaciones (multipart) |
| `DELETE` | `/api/dvi/items/:item_id/photos/:photo_id` | Eliminar foto |
| `GET` | `/api/dvi/:id/public` | Vista pública del DVI (sin auth, para compartir con cliente) |

---

### 5.5 Clientes y Vehículos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/customers` | Buscar clientes: `?search=nombre_o_telefono` |
| `POST` | `/api/customers` | Crear cliente |
| `GET` | `/api/customers/:id` | Detalle con vehículos e historial |
| `PUT` | `/api/customers/:id` | Actualizar cliente |
| `GET` | `/api/customers/:id/vehicles` | Vehículos del cliente |
| `POST` | `/api/customers/:id/vehicles` | Agregar vehículo |
| `GET` | `/api/vehicles/:id/work-orders` | Historial de órdenes del vehículo |

---

### 5.6 Mensajería

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/messages/send` | Enviar mensaje manual `{ customer_id, type, channel, body }` |
| `GET` | `/api/messages` | Historial de mensajes con filtros |
| `GET` | `/api/messages/templates` | Listar plantillas de mensajes |
| `PUT` | `/api/messages/templates/:type` | Actualizar plantilla de un tipo |

---

### 5.7 Citas

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/appointments` | Citas con filtros: `?date=`, `?status=`, `?technician_id=` |
| `POST` | `/api/appointments` | Crear cita |
| `PUT` | `/api/appointments/:id` | Actualizar cita |
| `PATCH` | `/api/appointments/:id/status` | Cambiar estado |
| `POST` | `/api/appointments/:id/convert` | Convertir cita en orden de trabajo |

---

### 5.8 Facturación y POS

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/invoices` | Generar factura desde orden de trabajo |
| `GET` | `/api/invoices/:id` | Detalle de factura |
| `PATCH` | `/api/invoices/:id/payment` | Registrar pago `{ payment_method, amount }` |
| `GET` | `/api/invoices/:id/pdf` | Descargar factura en PDF |
| `POST` | `/api/pos/sale` | Venta directa en mostrador (sin orden) |

---

### 5.9 Dashboard y Reportes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Ingresos del día, órdenes activas, técnicos ocupados |
| `GET` | `/api/dashboard/technician-workload` | Carga de trabajo por técnico |
| `GET` | `/api/reports/revenue` | Reporte de ingresos: `?from=&to=&group_by=day\|week\|month` |
| `GET` | `/api/reports/parts-usage` | Refacciones más utilizadas en un período |
| `GET` | `/api/reports/technician-performance` | Horas registradas y órdenes completadas por técnico |
| `GET` | `/api/reports/inventory` | Reporte de inventario actual con alertas |

---

## 6. Requisitos No Funcionales

| Área | Requisito |
|---|---|
| **Seguridad** | JWT con expiración de 8h. HTTPS obligatorio. Roles validados en cada endpoint (middleware de autorización). |
| **Almacenamiento de fotos** | Almacenamiento en nube (S3 o equivalente). Límite de 10 MB por foto. Formatos: JPG, PNG, HEIC. |
| **SMS** | Entrega garantizada con reintentos (máx. 3). Log de cada mensaje con estado de entrega. |
| **Rendimiento** | El endpoint `/api/parts/scan/:sku` debe responder en < 200 ms (índice en columna `sku`). |
| **Offline del portal mecánico** | Soporte básico offline con sincronización al reconectar (PWA con service workers). |
| **Auditoría** | Log de quién cambió qué en órdenes de trabajo e inventario, con timestamp. |
| **Idioma** | Interfaz en español. Formato de fecha DD/MM/YYYY. Moneda en MXN. |

---

## 7. Integraciones Externas

| Servicio | Propósito |
|---|---|
| **Twilio / Vonage** | Envío de SMS |
| **AWS S3 / Cloudflare R2** | Almacenamiento de fotos de DVI |
| **Stripe / OpenPay / Conekta** | Procesamiento de pagos con tarjeta en POS |
| **CFDI (SAT México)** | Timbrado de facturas electrónicas (opcional fase 2) |

---

## 8. Glosario

| Término | Definición |
|---|---|
| **DVI** | Digital Vehicle Inspection — inspección digital del vehículo |
| **Orden de Trabajo (OT)** | Documento que registra todos los servicios y refacciones de una visita al taller |
| **POS** | Point of Sale — punto de venta para ventas directas |
| **SKU** | Stock Keeping Unit — código único de identificación de refacción |
| **Stock mínimo** | Nivel de inventario que activa la alerta de reorden |
| **Fichar** | Acción del técnico de marcar inicio o fin de trabajo en una tarea |
