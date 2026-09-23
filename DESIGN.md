---
name: "Biblioteca Pública Municipal"
description: "Un índice vivo inspirado en los vanos de ladrillo de la biblioteca municipal."
colors:
  green-900: "#153d28"
  green-800: "#185433"
  green-700: "#1d6f3d"
  green-100: "#dce9df"
  brick-900: "#6f2d20"
  brick-700: "#9d432d"
  brick-600: "#b45034"
  brick-100: "#f0dcd3"
  cream-50: "#faf7ef"
  cream-100: "#f2ecdf"
  cream-200: "#e5dccb"
  ink: "#1f2a23"
  ink-soft: "#526057"
  sun: "#d89d3d"
  danger: "#a2322c"
  white: "#fffdfa"
typography:
  display:
    fontFamily: "Archivo Local, sans-serif"
    fontSize: "clamp(3.25rem, 6.4vw, 5.8rem)"
    fontWeight: 880
    lineHeight: 0.91
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo Local, sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo Local, sans-serif"
    fontSize: "1.18rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo Local, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Local, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "0.02em"
rounded:
  sm: "10px"
  md: "14px"
components:
  button-primary:
    backgroundColor: "{colors.green-700}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 17px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.green-800}"
    textColor: "{colors.white}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 17px"
    height: "46px"
  search-box:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "14px 14px 14px 4px"
    padding: "7px 8px 7px 20px"
    height: "68px"
  book-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "14px 14px 14px 4px"
  genre-tag:
    backgroundColor: "{colors.brick-100}"
    textColor: "{colors.brick-900}"
    rounded: "999px"
    padding: "6px 9px"
  status-available:
    backgroundColor: "{colors.green-100}"
    textColor: "{colors.green-900}"
    rounded: "999px"
    padding: "5px 8px"
  admin-nav-active:
    backgroundColor: "{colors.cream-50}"
    textColor: "{colors.green-900}"
    rounded: "{rounded.sm}"
    padding: "10px 13px"
    height: "48px"
---

# Design System: Biblioteca Pública Municipal

## Overview

**Creative North Star: "Índice de ladrillo"**

El sistema convierte los vanos de ladrillo del frontis en un índice vivo: una arquitectura cálida, pública y reconocible donde cada libro ocupa un módulo y la información parece extraerse físicamente de la fachada. La experiencia combina hospitalidad cultural con claridad operativa; evita tanto la frialdad institucional como el lenguaje comercial de una tienda.

La interfaz trabaja con densidad controlada y jerarquías contundentes. La portada pública da protagonismo a la búsqueda y a una retícula irregular de títulos reales, mientras que la administración conserva la misma identidad con una composición más compacta, tabular y orientada al mostrador. El movimiento refuerza la metáfora: una coincidencia asciende, las demás fichas se reorganizan y el detalle se despliega en continuidad dentro de la fachada.

**Key Characteristics:**

- Fachada de ladrillo reinterpretada como retícula modular irregular.
- Terracota, verde municipal, crema mineral, tinta vegetal y ámbar solar.
- Una sola familia grotesca variable con peso y ancho expresivos.
- Rectángulos táctiles con una esquina inferior izquierda más corta.
- Profundidad suave reservada para selección, apertura y respuesta.
- Densidad pública acogedora y densidad administrativa funcional.

## Colors

La paleta toma su temperatura del ladrillo y su autoridad del verde municipal; los cremas mantienen el conjunto luminoso y la tinta vegetal evita el negro absoluto.

### Primary

- **Verde municipal:** Estructura la marca, las acciones principales, la navegación administrativa y los mensajes de disponibilidad positiva.
- **Verde municipal profundo:** Sostiene franjas institucionales, fondos de alto contraste y superficies operativas.
- **Verde mineral pálido:** Identifica portadas ausentes, estados positivos y superficies auxiliares sin competir con el contenido.

### Secondary

- **Terracota de ladrillo:** Conecta la interfaz con el frontis físico, acentúa titulares y construye la retícula firma.
- **Terracota profunda:** Define huecos, contraste interno y estados de alerta vinculados al inventario.
- **Arcilla pálida:** Da fondo a iconos, etiquetas y estados secundarios.

### Tertiary

- **Ámbar solar:** Se reserva para foco visible, selección y llamadas puntuales sobre fondos verdes.
- **Rojo de atención:** Señala errores, vencimientos y falta de disponibilidad; nunca funciona como color ornamental.

### Neutral

- **Crema mineral claro:** Es el lienzo principal de lectura y de los paneles.
- **Crema mineral medio:** Separa zonas amplias y aporta profundidad tonal sin crear cajas nuevas.
- **Crema mineral de borde:** Delimita controles, divisores y tablas.
- **Tinta vegetal:** Es el color principal de texto y de acciones oscuras.
- **Tinta vegetal suave:** Reduce jerarquía en texto explicativo y metadatos.
- **Blanco cálido:** Eleva tarjetas, sugerencias y controles sobre los cremas.

### Named Rules

**The Ladrillo y Municipio Rule.** El terracota aporta memoria física y el verde aporta servicio público; ninguno debe convertirse en un relleno decorativo omnipresente.

## Typography

**Display Font:** Archivo Local variable (with sans-serif fallback)
**Body Font:** Archivo Local variable (with sans-serif fallback)
**Label/Mono Font:** Archivo Local variable (with sans-serif fallback)

**Character:** Una única grotesca variable mantiene la voz contemporánea y accesible. El contraste nace del peso, la condensación y la escala, no de mezclar familias tipográficas.

### Hierarchy

- **Display** (880, fluido de gran escala, 0.91): Titulares de bienvenida; usa ancho condensado y espaciado negativo para formar bloques compactos.
- **Headline** (700, fluido de sección, 0.98): Encabezados de catálogo y administración; firme sin competir con el display.
- **Title** (700, 1.18rem, 1.12): Títulos de libros y unidades de contenido.
- **Body** (400, 1rem, 1.55): Lectura general; los párrafos descriptivos se limitan visualmente a unas 46–65ch según el contexto.
- **Label** (700, 0.78rem, 0.02em): Navegación, estados, rótulos institucionales y metadatos compactos.

### Named Rules

**The Una Familia Rule.** Toda la jerarquía usa Archivo Variable; el peso, el ancho y la escala hacen el trabajo expresivo.

## Layout

El contenido público se limita a un contenedor fluido de hasta 1240px. La primera vista se divide entre búsqueda y relato a la izquierda y la fachada-index a la derecha; el catálogo inferior usa doce columnas con tarjetas de anchuras variables para evitar el ritmo de tienda. La administración contrapone una barra lateral fija de 264px con un área de trabajo fluida; sus estadísticas también nacen de doce columnas y se agrupan como un libro contable.

En 1050px la portada pasa a una sola columna, las tarjetas públicas ocupan cuatro columnas y la navegación administrativa se comprime a 84px. En 760px la navegación administrativa se transforma en panel deslizable, las tarjetas ocupan seis columnas y la búsqueda apila su acción. En 480px las tarjetas ocupan el ancho completo y los formularios pasan a una sola columna. Los huecos recurrentes de 7–24px mantienen la densidad interna; separaciones mayores de 28–112px articulan secciones y respiración editorial.

## Elevation & Depth

El sistema combina capas tonales con elevación reactiva. Las superficies permanecen contenidas en reposo y adquieren sombra cuando una tarjeta asciende, una sugerencia aparece o un panel se abre. En la fachada, la profundidad también se expresa mediante huecos internos, desplazamiento vertical, desenfoque momentáneo y escala.

### Shadow Vocabulary

- **Elevación baja:** Sombra ambiental corta para portada, tarjetas, marca y controles flotantes.
- **Elevación alta:** Sombra amplia para tarjetas activas, sugerencias, diálogos y notificaciones.
- **Hueco de ladrillo:** Sombra interior oscura que hace legibles los vanos de la fachada.
- **Panel extraído:** Sombra profunda y cálida para el detalle que emerge del índice.

### Named Rules

**The Depth Responds Rule.** La sombra intensa aparece como respuesta a foco, hover, selección o apertura; no se aplica por igual a todas las superficies.

## Shapes

La forma base es rectangular, modular y moderadamente redondeada. Controles y navegación usan curvas de 10px; paneles y tarjetas usan 14px. Los contenedores principales y las tarjetas firma recortan la esquina inferior izquierda —por ejemplo 14px 14px 14px 4px— para recordar una pieza encajada en mampostería. Las etiquetas de género y estado son las únicas formas plenamente píldora; los huecos de ladrillo conservan radios mínimos.

## Components

### Buttons

- **Shape:** Rectángulo táctil con curvas moderadas (10px) y altura mínima de 46px.
- **Primary:** Verde municipal con texto blanco cálido y relleno horizontal compacto (10px 17px).
- **Hover / Focus:** Asciende 2px, oscurece al verde profundo y recibe sombra; el foco visible usa un contorno ámbar de 3px separado 3px.
- **Secondary / Ghost / Tertiary:** La variante quieta es transparente, usa borde crema y gana un fondo crema medio al pasar el puntero; terracota y rojo se reservan para devolución, alerta o peligro.

### Chips

- **Style:** Las etiquetas de género usan arcilla pálida, texto terracota profundo y relleno de 6px 9px; los estados usan fondos semánticos de verde, gris, arcilla o rojo.
- **State:** La forma píldora distingue metadatos y estado, no acciones generales.

### Cards / Containers

- **Corner Style:** Curva moderada con esquina inferior izquierda recortada (14px 14px 14px 4px).
- **Background:** Blanco cálido sobre crema mineral; verde pálido para visuales sin portada.
- **Shadow Strategy:** Elevación baja en reposo y alta al elevarse en hover o foco.
- **Border:** Los bordes se usan como divisores crema; la silueta y el tono cargan la mayor parte de la separación.
- **Internal Padding:** El contenido de tarjeta usa 19px; encabezados y secciones operativas se mueven entre 18px y 24px.

### Inputs / Fields

- **Style:** Fondo blanco cálido, trazo mineral de 1px y radio de 10px; el buscador protagonista usa trazo verde de 2px y silueta asimétrica.
- **Focus:** El borde cambia a verde y aparece un halo ámbar translúcido de 3px.
- **Error / Disabled:** Los errores adoptan rojo de atención; los controles deshabilitados bajan a 58% de opacidad y eliminan desplazamiento y sombra.

### Navigation

La navegación pública es horizontal, compacta y de alto contraste; en móvil conserva solo el acceso administrativo como icono. La navegación interna vive sobre verde profundo y su opción activa invierte a crema claro con texto verde; a 1050px se reduce a iconos y a 760px se convierte en panel lateral deslizable.

### Índice de ladrillo

La fachada firma combina huecos oscuros y hasta tres volúmenes de libro en una retícula irregular de cinco por siete. Al buscar, la retícula se desenfoca durante 260ms, la coincidencia asciende durante 700ms y el detalle se abre dentro del mismo plano en 480ms. La continuidad espacial —no un salto de página— comunica que el volumen fue extraído del edificio.

### Administración

El tablero reinterpreta la retícula como libro contable: estadísticas sobre verde profundo, alertas terracota y tablas blancas con divisores crema. Las acciones frecuentes son filas anchas de 86px con iconos sobre arcilla pálida; los formularios secundarios aparecen en una hoja lateral de hasta 620px.

## Do's and Don'ts

### Do:

- **Do** conserva la tensión entre módulos irregulares y alineaciones precisas para que la interfaz recuerde una fachada habitable.
- **Do** usa la elevación y el movimiento para explicar selección, reordenamiento y apertura.
- **Do** mantiene búsqueda, disponibilidad y préstamo presencial como información dominante y legible.
- **Do** hereda la paleta y la geometría pública en administración, aumentando densidad sin perder calidez.

### Don't:

- **Don't** conviertas el catálogo en una cuadrícula uniforme de tienda con tarjetas idénticas.
- **Don't** reduzcas la identidad a un portal gubernamental estéril o excesivamente burocrático.
- **Don't** uses sombras intensas en todas las cajas ni píldoras para cada control.
- **Don't** introduzcas reservas, compras o cuentas públicas en la jerarquía visual.
