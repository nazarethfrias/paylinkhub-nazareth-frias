# Cómo utilicé la IA

Inicio: 2 de noviembre de 2026, 9:57 a. m., Panamá.
Herramienta utilizada: ChatGPT.

## Elección de tecnologías

Elegí Node.js con Express y un panel en HTML, CSS y JavaScript
porque ya he trabajado con estas tecnologías.
Quería concentrarme en la integración, el manejo de fallas
y una ejecución local sencilla.

## Forma de trabajo

Trabajé por etapas: endpoint con datos de ejemplo, integración real,
manejo de errores y panel.

ChatGPT generó gran parte del código inicial. Yo lo incorporé,
lo ejecuté en mi equipo, comprobé las respuestas y reporté los problemas.
También personalicé el diseño y gestioné los commits en GitHub.

## Prompts representativos

### Inicio

Prompt exacto: "Empecemos"

La IA propuso configurar el proyecto y después generó
el esqueleto del endpoint y una pantalla con datos de ejemplo.
Lo incorporé y comprobé su ejecución antes de guardar el avance.

### Panel y requisitos

Prompt exacto:
"okey,entiendo. continuemos, recuerda seguir las indicaciones del pdf"

La respuesta incluyó un panel con cliente, resumen, tabla,
filtro y salud de proveedores. Lo incorporé y revisé visualmente.

### Personalización

Prompt exacto:
"damelo con las letras en verde plis, para ponerle mi toque"

Apliqué los cambios de CSS propuestos y mantuve los errores en rojo.

### Revisión de la integración

Prompt exacto:
"sigue igual dame los codigos ocmpleto corregido en los que debo realizar los cambios"

La IA entregó una versión completa del servidor con identificación
de versión y configuración en puerto 3001.
Comprobé que la nueva respuesta incluyera los cuatro proveedores.

## Código que pedí corregir

La primera versión de arranque no manejaba explícitamente
el error de puerto ocupado. Durante las pruebas seguía viendo
una respuesta anterior, así que cuestioné el resultado.

Revisamos los procesos, detuvimos la instancia anterior e incorporamos
manejo de EADDRINUSE y una etiqueta de versión.
También cambiamos el puerto a 3001.

Validé el resultado consultando el endpoint y viendo los cuatro
proveedores en el panel. La confusión entre terminales e instancias
también contribuyó al problema.

## Contrato y mapeo

Se conservan de CORE únicamente ID, nombre, correo, teléfono y dirección.
El mapeador construye una lista explícita de campos permitidos.
Se descartan contraseñas, identificadores sensibles, información bancaria,
billeteras y otros campos que el panel no necesita.

Cada carrito se representa como un consumo simulado.
Se recalculan bruto, descuento y neto desde los productos.
No se inventan fechas ni estados de pago.

Si PAGOS falla, los agregados son null para distinguir indisponibilidad
de una respuesta válida sin consumos.

## Verificaciones

- HTTP 200 para el dashboard.
- HTTP 400 para un identificador inválido.
- HTTP 404 de CORE con un solo intento.
- HTTP 500 con dos intentos.
- Timeout con dos intentos.
- Conservación de datos disponibles ante fallas.
- Filtro con coincidencias y sin resultados.
- Aserciones locales de campos permitidos y cálculos.
- Exclusión de .env y node_modules del seguimiento de Git.
- Instalación con npm ci y ejecución verificadas desde un clon local limpio en el puerto 3002.

Las aserciones se ejecutaron con node -e.
No quedaron incorporadas como suite automatizada en el repositorio.

## Propuesta de innovación

Alertas ante degradación de proveedores para que los operadores
detecten incidentes más rápido.
El primer alcance sería almacenar métricas, evaluar umbrales
y mostrar alertas deduplicadas.

Mediría tiempo de detección y falsas alertas.
Los umbrales deben calibrarse con datos operativos reales.
La propuesta está documentada y no implementada.

## Balance del uso de IA

Estimo que el 75 % del código fue generado por IA y el 25 %
fue escrito o modificado por mí.
Es una estimación aproximada, no una medición automática.

Mi trabajo también incluyó configuración, incorporación del código,
ejecución local, comprobaciones, solicitud de correcciones,
personalización visual y gestión de commits.

Lo que hizo bien la IA: acelerar la estructura de integración
y la construcción del panel.

Lo que hizo mal: la primera versión no diagnosticaba explícitamente
el puerto ocupado y las instrucciones por fragmentos generaron
confusión durante los cambios.