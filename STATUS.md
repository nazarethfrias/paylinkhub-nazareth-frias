# Estado de entrega

Inicio declarado: 2 de noviembre de 2026, 9:57 a. m., Panamá.
Límite previsto: 11:57 a. m.

Prioricé la integración funcional, la tolerancia a fallas
y un panel conectado al backend.

## Requisitos principales

| Requisito | Estado | Observación |
|---|---|---|
| Esqueleto funcional | Hecho | Commit ed6dd1e con endpoint y pantalla inicial |
| Commit antes del minuto 30 | No hecho | Registrado a las 10:27:49; 30 minutos y 49 segundos desde el inicio declarado |
| Contrato canónico | Hecho | Modelo propio documentado en README |
| Filtrado de campos sensibles | Hecho | Lista explícita y aserción local satisfactoria |
| CORE y PAGOS reales | Hecho | Consultas concurrentes con datos visibles en el panel |
| Timeout y reintentos | Hecho | 2500 ms por intento, un reintento ante 5xx o timeout |
| No reintentar 4xx | Hecho | CORE HTTP_404 con attempts: 1 |
| Degradación elegante | Hecho | HTTP 200, partial y warnings conservando información disponible |
| Mini panel | Hecho | Cliente, consumos, resumen y salud de proveedores |
| Configuración externa | Hecho | Variables de entorno y .env.example |
| Exclusiones de Git | Hecho | .env y node_modules ignorados y sin seguimiento |

## Mejoras y verificaciones

| Requisito | Estado | Observación |
|---|---|---|
| Filtro | Hecho | Verificado con “carrito” y “zzzz” |
| Validación de ID | Hecho | Identificador abc devuelve HTTP 400 |
| Logs estructurados | Hecho | Resultado, intentos, latencia y errores de mapeo |
| Cálculos del mapeador | Hecho | Aserción local: bruto 20, descuento 2 y neto 18 |
| Propuesta de innovación | Hecho | Alertas de degradación documentadas |
| Documentación | Hecho | README, AI-LOG y STATUS preparados; publicación final pendiente |

## Pendientes

| Requisito | Estado | Siguiente paso |
|---|---|---|
| FX y caché TTL | No hecho | Cliente FX con validación y caché en memoria con vencimiento |
| Circuit breaker | No hecho | Estados cerrado, abierto y semiabierto por proveedor |
| Boceto de innovación | No hecho | Diagrama de métricas, evaluación y alertas |
| Auto-refresh | No hecho | Polling sin consultas superpuestas |
| Test automatizado versionado | No hecho | Convertir las aserciones ejecutadas en tests del repositorio |

## Alcance

Las verificaciones se realizaron manualmente y con aserciones puntuales.
No existe una suite automatizada versionada.

Los proveedores INESTABLE fallan deliberadamente.
Una respuesta parcial es esperada aunque CORE y PAGOS estén disponibles.

Los carritos son consumos simulados y no representan pagos procesados.
No se inventaron fechas ni estados ausentes en el proveedor.

La hora real de cierre se registrará al finalizar.