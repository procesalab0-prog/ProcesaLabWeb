# Dirección visual para mostrar proyectos

## Decisión principal

Los proyectos de ProcesaLab se presentarán mediante escenas de producto inspiradas en la claridad y el protagonismo visual de las páginas de Apple: teléfonos y otros dispositivos en primer plano mostrando capturas reales de nuestras aplicaciones, sistemas y sitios web.

Esta dirección sustituirá gradualmente recursos abstractos que explican menos el trabajo —por ejemplo, el archivero actual— por demostraciones visibles del producto funcionando.

## Referencias compartidas

- `Captura de pantalla 2026-09-10 a la(s) 10.18.30 a.m..png`: dispositivo desplegable sostenido con ambas manos; útil como referencia para una composición panorámica que muestre varias vistas de un proyecto.
- `Captura de pantalla 2026-09-10 a la(s) 10.20.31 a.m..png`: teléfono horizontal sobre una mano; útil para transiciones, recorridos y secciones donde el dispositivo parezca flotar o deslizarse.
- `Captura de pantalla 2026-09-10 a la(s) 10.21.00 a.m..png`: teléfono vertical en una mano; útil para destacar una sola aplicación, función o caso de éxito.

Las imágenes son referencias de composición y presentación. La ejecución final tendrá identidad propia de ProcesaLab y no copiará literalmente anuncios, dispositivos exclusivos ni interfaces de Apple.

## Aplicación en la web

1. Reemplazar el archivero de proyectos por un dispositivo protagonista que muestre una app o web real de ProcesaLab.
2. Usar escenas estáticas en tarjetas, portadas de casos de éxito y bloques editoriales.
3. Usar escenas animadas en puntos importantes de la navegación:
   - entrada suave del dispositivo al hacer scroll;
   - inclinación o giro leve según el movimiento del cursor;
   - cambio de pantalla para alternar entre proyectos;
   - acercamiento a una función concreta;
   - desplazamiento horizontal o vertical dentro de la pantalla;
   - composición de varios dispositivos que se separan o se reúnen.
4. Mostrar siempre capturas reales y actualizadas de los proyectos dentro de la pantalla.
5. Combinar teléfonos con laptop, tablet o navegador cuando el proyecto no sea principalmente móvil.

## Lenguaje visual ProcesaLab

- Fondos rosa, crema, lavanda y negro de la marca.
- Naranja ProcesaLab para acciones, detalles, reflejos y puntos de atención.
- Dispositivos limpios y realistas, con encuadres grandes y mucho espacio para respirar.
- Textos breves: nombre del proyecto, problema resuelto, resultado y llamada a verlo.
- Sombras y profundidad elegantes, sin perder el carácter gráfico actual.
- Animaciones sencillas pero memorables; deben reforzar la demostración del proyecto, no distraer.

## Comportamiento adaptable

- En computadora: composiciones amplias, dispositivos parcialmente fuera del encuadre y movimiento ligado al scroll.
- En iPad: uno o dos dispositivos completos, sin recortes accidentales.
- En teléfono: un dispositivo vertical protagonista, animaciones más cortas y controles táctiles claros.
- Respetar `prefers-reduced-motion` y ofrecer una presentación estática equivalente.

## Primer caso recomendado

Rediseñar la sección actual de proyectos empezando por el espacio del archivero. La primera versión puede mostrar un iPhone con Vaquero HUB, Tacos Don Luis o Herraidea en pantalla, acompañado por un selector sencillo para cambiar de proyecto. Después se pueden añadir variantes animadas en el hero, servicios y casos de éxito.

## Siguiente etapa acordada: animaciones con Higgsfield

Tomar la implementación de Tacos Don Luis como referencia para animar las demás escenas de producto de la landing. Las nuevas piezas visuales se producirán con Higgsfield y se integrarán con el mismo comportamiento ligado al scroll: al bajar, la animación avanza; al subir, retrocede; al detener el desplazamiento, conserva el fotograma actual.

Actualización del 12 de septiembre de 2026: por petición del usuario, Mi Tienda SM se adelantó. Se generaron dos clips independientes de 5 segundos en 1080p con Higgsfield, mostrando únicamente las pantallas de acceso autorizadas. Comparten un controlador reversible de scroll con Don Luis, carga diferida y respaldo estático. Don Luis se movió inmediatamente después del hero y la marquesina. Se conservan los recursos anteriores para facilitar la reversión.

Orden restante previsto:

1. Herraidea: animar el dispositivo plegable conservando la interfaz y la estructura del sitio.
2. Muromío: animar las dos tabletas, cuidando especialmente el encuadre y la legibilidad en teléfono.
3. Revisar las demás escenas de proyectos que se incorporen a la landing y aplicar el mismo sistema cuando aporte claridad.

Requisitos para cada generación:

- Utilizar una imagen base limpia y de alta resolución antes de generar el video.
- Mantener sin cambios los logos, textos, capturas, colores e interfaces de cada proyecto.
- Evitar halos, bordes dentados, píxeles sueltos y recortes visibles alrededor de dispositivos o manos.
- Usar movimientos breves y sutiles que puedan recorrerse en ambos sentidos mediante el scroll.
- Integrar el fondo del video con el color real de su sección.
- Conservar una imagen estática como respaldo y para `prefers-reduced-motion`.
- Comprobar el resultado en teléfono, iPad y computadora antes de publicarlo.

## Recursos necesarios al implementarlo

- Capturas limpias de cada app o web en móvil y computadora.
- Selección del proyecto principal que aparecerá primero.
- Mockups propios o con licencia adecuada.
- Versiones optimizadas en WebP/AVIF y alternativas para pantallas pequeñas.
