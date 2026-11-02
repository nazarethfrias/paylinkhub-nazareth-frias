# PayLinkHub

Aplicación local para consultar información de clientes y consumos
simulados. Incluye un panel que muestra la salud de los proveedores
y conserva la información disponible cuando alguno falla.

## Tecnologías

Backend con Node.js y Express.
Panel con HTML, CSS y JavaScript.

Elegí estas tecnologías por mi experiencia previa y porque permiten
ejecutar el proyecto con pocos pasos, sin base de datos.

## Requisitos

- Node.js 24 y npm.
- Git.
- Acceso a internet para consultar las APIs públicas.
- Un navegador actualizado.

No se necesitan credenciales ni claves de API.

## Instalación y ejecución

```bash
git clone https://github.com/nazarethfrias/paylinkhub-nazareth-frias.git
cd paylinkhub-nazareth-frias
npm ci
```

Crear la configuración local.

Windows CMD:

```bat
copy .env.example .env
```

Linux o macOS:

```bash
cp .env.example .env
```

Iniciar:

```bash
npm start
```

Abrir el panel en:

http://localhost:3001

Mantener la terminal abierta mientras se utiliza la aplicación.
Para detenerla, presionar Ctrl + C.

El puerto se configura mediante PORT. Si está ocupado, detener
la instancia anterior o configurar otro puerto en .env.

## Uso del panel

Ingresar un identificador entero positivo y pulsar Consultar cliente.

El panel muestra:

- Nombre, correo, teléfono y dirección.
- Resumen y tabla de consumos.
- Filtro por ID o descripción.
- Estado, latencia e intentos de cada proveedor.
- Advertencias cuando la información es parcial.

Los datos de DummyJSON son ficticios. Los carritos representan
consumos simulados; la aplicación no procesa pagos reales.

El proveedor no entrega fechas de transacción. Se mantiene el orden
recibido sin inventar fechas ni estados de pago.

## Proveedores

| Proveedor | Función |
|---|---|
| CORE | Información del cliente |
| PAGOS | Carritos utilizados como consumos simulados |
| INESTABLE_500 | Demostrar manejo de HTTP 500 |
| INESTABLE_LENTO | Demostrar timeout |

Las URLs se configuran en .env y están documentadas en .env.example.
El archivo .env no se incluye en Git.

Los proveedores INESTABLE fallan deliberadamente. Por eso es normal
recibir partial: true aunque CORE y PAGOS estén disponibles.

## Endpoint

```bash
curl -i http://localhost:3001/api/v1/dashboard/1
```

Resultado esperado: HTTP 200 con los datos disponibles, estado
de proveedores y advertencias.

Los datos, latencias y resultados externos pueden variar.

## Contrato canónico

La respuesta utiliza un modelo propio, separado de los formatos
de los proveedores.

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

### Interpretación de la respuesta

- customer es null cuando CORE falla o su respuesta no puede mapearse.
- transactions es una lista vacía cuando no hay consumos o PAGOS falla.
- El conteo y el total del resumen son null si PAGOS falla.
  Son cero cuando responde correctamente sin consumos.
- partial es true si al menos un proveedor falla.
- warnings identifica el proveedor y su código de fallo.
- latencyMs incluye intentos y esperas del cliente HTTP, sin el mapeo.
- La salud representa esta consulta, no un historial de disponibilidad.

Un identificador inválido devuelve HTTP 400.
Las fallas esperadas de proveedores devuelven HTTP 200 con datos parciales.
Los errores internos inesperados devuelven HTTP 500.

## Decisiones técnicas

- Consultas concurrentes con manejo individual de fallas esperadas.
- Mapeo explícito de campos permitidos, sin devolver el payload de CORE.
- Timeout de 2500 ms por intento y un reintento máximo ante HTTP 5xx
  o timeout. Nunca se reintentan errores 4xx.
- Backoff de 300 * 2^n ms. Con un reintento configurado,
  la espera antes del segundo intento es de 300 ms.

Cada carrito representa un consumo. Los importes se recalculan
desde precio, cantidad y descuento por producto, redondeando cada
línea a centavos. El resumen suma los importes netos calculados.

El panel utiliza textContent para representar los datos externos
como texto.

## Tests automatizados

Ejecutar:

```bash
npm test
```

Se incluyen cuatro pruebas en test/mappers.test.js:

1. El cliente solo incluye los campos permitidos.
2. Los importes se recalculan sin confiar en los totales del proveedor.
3. Una lista vacía se distingue de una estructura inválida.
4. Se rechazan descuentos fuera del rango permitido.

Resultado observado: cuatro pruebas aprobadas y cero fallidas.
Estas pruebas cubren los mapeadores, no toda la aplicación.

## Verificaciones manuales

- Dashboard del cliente 1: HTTP 200.
- Identificador abc: HTTP 400.
- Cliente inexistente: CORE HTTP_404 con un solo intento.
- Proveedor con HTTP 500: dos intentos.
- Proveedor lento: TIMEOUT con dos intentos.
- El panel conserva cliente y consumos ante las fallas simuladas.
- Filtro con coincidencias y sin coincidencias.
- .env y node_modules ignorados y sin seguimiento en Git.
- Instalación con npm ci y ejecución desde un clon local limpio
  en el puerto 3002.

El puerto 3002 se utilizó únicamente para verificar la copia limpia.
El puerto configurado para la ejecución habitual es 3001.

## Propuesta de innovación

Propondría alertas proactivas cuando un proveedor acumule errores
o aumente su latencia, para ayudar a los operadores a detectar incidentes.
En un próximo sprint almacenaría métricas, definiría umbrales por ventana
de tiempo y mostraría alertas deduplicadas.
Mediría tiempo de detección y falsos positivos, ajustando los umbrales
con tráfico real. No incluye desviar pagos automáticamente.

## Limitaciones conocidas

- FX y su caché TTL están pendientes.
- Sin circuit breaker ni auto-refresh.
- Sin autenticación ni persistencia.
- Sin paginación adicional de consumos.
- Las políticas HTTP se verificaron manualmente, sin tests automatizados.
- Dependencia de disponibilidad y contratos de APIs públicas.
- Los cálculos usan números de JavaScript y redondeo a centavos;
  una solución financiera productiva requiere revisar precisión y límites.
- Falta validación exhaustiva de las variables de timeout y reintentos.

El alcance se detalla en STATUS.md.
El uso de IA se describe en AI-LOG.md.