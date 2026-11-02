# PayLinkHub

Aplicación local para consultar información de clientes y consumos
simulados, con un panel que muestra la salud de los proveedores
y conserva los datos disponibles cuando alguno falla.

## Tecnologías

Node.js y Express para el backend.
HTML, CSS y JavaScript para el panel.

Elegí estas tecnologías por mi experiencia previa y porque permiten
ejecutar el proyecto con pocos pasos, sin base de datos.

## Requisitos

- Node.js 24 y npm.
- Git.
- Acceso a internet para consultar las APIs públicas.
- Un navegador actualizado.

No se necesitan credenciales ni claves de API.

## Instalación

```bash
git clone https://github.com/nazarethfrias/paylinkhub-nazareth-frias.git
cd paylinkhub-nazareth-frias
npm ci
```

Crear el archivo de configuración.

En Windows CMD:

```bat
copy .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

Iniciar el servidor:

```bash
npm start
```

Abrir el panel en http://localhost:3001

La terminal debe permanecer abierta mientras se utiliza la aplicación.
Para detener el servidor, presionar Ctrl + C.

El puerto se configura mediante PORT. Si está ocupado, detener
la instancia anterior o configurar otro puerto y abrir esa dirección.

## Cómo utilizarlo

Ingresar un ID de cliente entero positivo y pulsar Consultar cliente.

El panel muestra:

- Nombre, correo, teléfono y dirección.
- Resumen y tabla de consumos.
- Filtro por ID o descripción.
- Estado, latencia e intentos por proveedor.
- Advertencias cuando la información es parcial.

Los datos de DummyJSON son ficticios. Los carritos representan
consumos simulados; esta aplicación no procesa pagos reales.

## Proveedores

| Proveedor | Función |
|---|---|
| CORE | Datos del cliente |
| PAGOS | Carritos utilizados como consumos simulados |
| INESTABLE_500 | Demostrar manejo de HTTP 500 |
| INESTABLE_LENTO | Demostrar timeout |

Las URLs se configuran en .env y se incluyen como ejemplos
en .env.example. No están incrustadas en el código de integración.

Los simuladores fallan deliberadamente. Por eso es normal recibir
partial: true aunque CORE y PAGOS funcionen.

## Endpoint

```bash
curl -i http://localhost:3001/api/v1/dashboard/1
```

Se espera HTTP 200 con información disponible, salud de proveedores
y advertencias. Los resultados externos y las latencias pueden variar.

## Contrato canónico

Ejemplo ilustrativo:

```json
{
  "customer": {
    "id": 1,
    "name": "Emily Johnson",
    "email": "emily.johnson@x.dummyjson.com",
    "phone": "+81 965-431-3024",
    "address": {
      "street": "626 Main Street",
      "city": "Phoenix",
      "country": "United States"
    }
  },
  "transactions": [
    {
      "id": 1,
      "description": "Consumo simulado - carrito 1",
      "currency": "USD",
      "itemCount": 12,
      "grossAmount": 13037.88,
      "discountAmount": 1527.07,
      "amount": 11510.81
    }
  ],
  "summary": {
    "currency": "USD",
    "transactionCount": 1,
    "totalAmount": 11510.81
  },
  "providers": [
    {
      "name": "CORE",
      "status": "up",
      "latencyMs": 443,
      "attempts": 1
    },
    {
      "name": "PAGOS",
      "status": "up",
      "latencyMs": 791,
      "attempts": 1
    },
    {
      "name": "INESTABLE_500",
      "status": "down",
      "latencyMs": 776,
      "attempts": 2,
      "error": "HTTP_500"
    },
    {
      "name": "INESTABLE_LENTO",
      "status": "down",
      "latencyMs": 5332,
      "attempts": 2,
      "error": "TIMEOUT"
    }
  ],
  "partial": true,
  "warnings": [
    "INESTABLE_500: HTTP_500",
    "INESTABLE_LENTO: TIMEOUT"
  ],
  "meta": {
    "version": "four-providers-v1",
    "mode": "live",
    "transactionSource": "simulated_carts",
    "generatedAt": "2026-11-02T16:04:51.000Z"
  }
}
```

### Interpretación

- customer es null si CORE falla o no puede mapearse.
- transactions es una lista vacía si no hay consumos o PAGOS falla.
- El resumen devuelve null si PAGOS falla y cero si responde sin consumos.
- partial indica que al menos un proveedor falló.
- warnings identifica el proveedor y el tipo de fallo.
- latencyMs incluye intentos y esperas del cliente HTTP, sin el mapeo.
- La salud representa esta consulta, no un historial de disponibilidad.

Un identificador inválido devuelve HTTP 400.
Las fallas esperadas de proveedores devuelven HTTP 200 con datos parciales.
Los errores internos inesperados devuelven HTTP 500.

## Decisiones técnicas

- Consultas en paralelo con manejo individual de fallas esperadas.
- Mapeo explícito de campos permitidos, sin devolver el payload de CORE.
- Timeout de 2500 ms por intento y un reintento máximo ante 5xx
  o timeout. Nunca se reintentan errores 4xx.
- Backoff de 300 * 2^n ms. Con un reintento configurado,
  se realiza una espera de 300 ms.

Cada carrito representa un consumo. Los importes se recalculan
desde precio, cantidad y descuento por producto, redondeando
cada línea a centavos. El resumen suma los netos calculados.

No se inventan fechas ni estados de pago que el proveedor no entrega.
El panel mantiene el orden recibido.

## Verificaciones realizadas

- Endpoint del cliente 1: HTTP 200.
- Identificador abc: HTTP 400.
- Cliente inexistente: CORE HTTP_404 con un solo intento.
- Proveedor con HTTP 500: dos intentos.
- Proveedor lento: timeout con dos intentos.
- Panel conserva cliente y consumos ante fallas simuladas.
- Filtro con coincidencias y sin coincidencias.
- Aserciones locales sobre campos permitidos y cálculo de importes.
- .env y node_modules no están registrados en Git.

Las verificaciones se ejecutaron manualmente y mediante una
instrucción de Node con aserciones. No hay una suite automatizada
versionada en el repositorio.

## Propuesta de innovación

Propondría alertas proactivas cuando un proveedor acumule errores
o aumente su latencia, para ayudar a los operadores a detectar incidentes.
En un próximo sprint almacenaría métricas, definiría umbrales por ventana
de tiempo y mostraría alertas deduplicadas.
Mediría tiempo de detección y falsos positivos, ajustando los umbrales
con tráfico real. La propuesta no incluye desviar pagos automáticamente.

## Limitaciones

- FX y caché TTL pendientes.
- Sin circuit breaker, auto-refresh ni suite automatizada.
- Sin autenticación ni persistencia.
- Sin paginación adicional de consumos.
- Dependencia de disponibilidad y contratos de APIs públicas.
- Los cálculos usan números de JavaScript y redondeo a centavos;
  una solución financiera productiva requiere revisar precisión y límites.
- Falta validación exhaustiva de las variables de timeout y reintentos.

El alcance y las pendientes se detallan en STATUS.md.
El uso de IA se describe en AI-LOG.md.