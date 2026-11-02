# Cómo utilicé la IA

Inicio: 2 de noviembre de 2026, 9:57 a. m., Panamá.
Herramienta utilizada: ChatGPT.

## Por qué elegí estas tecnologías

Elegí Node.js con Express para el backend y HTML, CSS y JavaScript
para el panel porque ya he trabajado con estas tecnologías.

Quería concentrarme en la integración y el manejo de fallas,
manteniendo sencilla la instalación y ejecución local.

## Cómo trabajé

Avancé por etapas: primero un endpoint con datos de ejemplo,
después la integración real, el manejo de errores y el panel.

ChatGPT generó gran parte del código inicial. Yo lo incorporé al
proyecto, lo ejecuté en mi equipo, comprobé las respuestas y compartí
los problemas que encontraba para pedir correcciones.

También personalicé los colores del panel y gestioné los commits
en GitHub.

## Prompts representativos

### Para comenzar

Prompt exacto:
"Empecemos"

La IA propuso configurar el proyecto y después generó un endpoint
y una pantalla inicial con datos de ejemplo.
Los incorporé y comprobé su ejecución antes de guardar el avance.

### Para continuar con los requisitos

Prompt exacto:
"okey,entiendo. continuemos, recuerda seguir las indicaciones del pdf"

La respuesta incluyó el panel con información del cliente,
resumen, tabla, filtro y salud de proveedores.
Lo incorporé y revisé los datos mostrados.

### Para personalizar el diseño

Prompt exacto:
"damelo con las letras en verde plis, para ponerle mi toque"

Apliqué los cambios de CSS y mantuve los estados de falla en rojo.

### Para revisar un problema de ejecución

Prompt exacto:
"sigue igual dame los codigos ocmpleto corregido en los que debo realizar los cambios"

Aunque había actualizado el código, seguía viendo una respuesta anterior.
La IA entregó el servidor completo con identificación de versión
y configuración en el puerto 3001.
Comprobé la corrección consultando el endpoint y viendo cuatro proveedores.

## Una propuesta que pedí corregir

La primera versión de arranque no manejaba explícitamente el error
de puerto ocupado. Durante las verificaciones seguía recibiendo
una respuesta anterior, así que no di el resultado por válido.

Revisamos los procesos y detuvimos la instancia anterior.
Se incorporó manejo de EADDRINUSE y una etiqueta de versión.
También cambiamos la configuración al puerto 3001.

La confusión entre terminales e instancias contribuyó al problema.
Pedir el archivo completo y comprobar la versión ejecutada ayudó
a resolverlo.

## Contrato y decisiones de mapeo

De CORE se conservan únicamente ID, nombre, correo, teléfono
y dirección. El objeto se construye con campos permitidos explícitos.

Se descartan contraseñas, identificadores sensibles, información
bancaria, billeteras y campos que el panel no necesita.

Cada carrito representa un consumo simulado.
Los importes se recalculan desde productos, cantidades y descuentos,
redondeando cada línea a centavos.

No se inventan fechas ni estados de pago.
Cuando PAGOS falla, los agregados son null para distinguir
indisponibilidad de una respuesta válida sin consumos.

## Verificaciones realizadas

- HTTP 200 para el dashboard.
- HTTP 400 para un identificador inválido.
- CORE HTTP_404 con un solo intento.
- HTTP 500 con dos intentos.
- Timeout con dos intentos.
- Conservación de los datos disponibles ante fallas.
- Filtro con coincidencias y sin resultados.
- Exclusión de .env y node_modules del seguimiento de Git.
- Instalación con npm ci y ejecución desde un clon local limpio
  en el puerto 3002.

## Tests automatizados

ChatGPT generó cuatro tests del mapeador.
Los incorporé en test/mappers.test.js y los ejecuté con npm test.

Las cuatro pruebas pasaron:

- Campos permitidos del cliente.
- Recálculo de importes sin confiar en totales externos.
- Diferencia entre lista vacía y estructura inválida.
- Rechazo de descuentos fuera de rango.

Esta cobertura es limitada al mapeo.
Las políticas de integración HTTP se comprobaron manualmente.

## Propuesta de innovación

Propondría alertas ante degradación de proveedores para ayudar
a los operadores a detectar incidentes más rápido.

El primer alcance sería almacenar métricas, evaluar umbrales
por ventana de tiempo y mostrar alertas deduplicadas.
Mediría tiempo de detección y falsas alertas.

Los umbrales deben calibrarse con datos operativos reales.
La propuesta está documentada, pero no implementada.

## Balance del uso de IA

Estimo que el 75 % del código fue generado por IA y el 25 %
fue escrito o modificado por mí.
Es una estimación aproximada, no una medición automática.

Mi participación también incluyó configuración, incorporación del código,
ejecución local, comprobaciones, solicitud de correcciones,
personalización visual y gestión de commits.

Lo que hizo bien la IA: acelerar la integración, el panel
y la preparación de pruebas del mapeador.

Lo que hizo mal: la primera versión no diagnosticaba explícitamente
el puerto ocupado y las instrucciones por fragmentos generaron
confusión durante los cambios.

## Manejo del tiempo

El primer commit funcional se registró a las 10:27:49 a. m.,
30 minutos y 49 segundos después del inicio declarado.
El esqueleto se entregó, pero el commit excedió por 49 segundos
el límite de los primeros 30 minutos.