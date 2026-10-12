# AABVerse - Portal de Minijuegos

**AABVerse** es una plataforma web interactiva y modular de minijuegos. El proyecto nace como un espacio para divertirse jugando y, a la vez, como un **laboratorio técnico personal** donde probar herramientas actuales, poner en práctica nuevas ideas de desarrollo, experimentar con patrones de arquitectura y crear interfaces cuidadas.

---

## Estructura del repositorio

Este proyecto está organizado en una arquitectura de monorepo:

- **`aabverse_frontend/`**: Aplicación web desarrollada con Angular 21.
- **`aabverse_backend/`**: Servicios y API del proyecto.

---

## Por qué este proyecto y cómo lo uso como laboratorio

Más allá de ser un sitio de juegos, utilizo **AABVerse** para experimentar y estar al día con la tecnología:

- **Probar a fondo las novedades de Angular.**
- **Arquitectura limpia y modular**: cada minijuego funciona de manera autónoma pero comparte navegación, diseño y utilidades dentro de la misma aplicación.
- **Diseño propio y buen rendimiento**: interfaz oscura, transparencias con desenfoque, detalles visuales cuidados y adaptación completa a pantallas de ordenador y móvil usando CSS puro sin sobrecargar con librerías externas.
- **Banco de pruebas continuo**: una base sólida para ir añadiendo en el futuro nuevas tecnologías que vaya aprendiendo.

---

## Tecnologías utilizadas

- **Frontend**: Angular 21 y Vercel Analytics.
- **Backend**: Python, FastAPI y Uvicorn.
- **Base de datos**: Neon (PostgreSQL).
- **Despliegue e infraestructura**: Vercel (Frontend SPA y Backend Serverless).
- **Gestor de paquetes y herramientas**: pnpm, Git y GitHub (arquitectura monorepo).

---

## Minijuegos

### 1. Legend Player: Modo Carrera

Un simulador de carrera futbolística donde creas a tu propio jugador y guías su trayectoria:

- **Creación de personaje**: elige tu nombre, nacionalidad, pie dominante y posición en el campo.
- **Gestión de la carrera**: decisiones clave fuera y dentro del campo, contratos y fichajes por grandes equipos.
- **Evolución**: sube tus atributos, consigue títulos y forja tu palmarés tanto desde el móvil como desde el ordenador.

### 2. AimShot: Campo de Tiro

Un juego de puntería y reflejos pensado para jugar con ratón:

- **3 modos de juego**:
  - **Contrareloj**: consigue la puntuación más alta posible antes de que se terminen los 45 segundos.
  - **Supervivencia**: aguanta con un número limitado de vidas; si dejas escapar dianas válidas o disparas a una penalización, pierdes vidas.
  - **Caza**: dianas en constante movimiento cruzando la pantalla en horizontal y vertical.
- **Tipos de dianas**: estándar (+100 puntos), doradas rápidas (+500 puntos) y rojas de penalización (-150 puntos y pérdida de vida).
- **Personalización de mirilla**: opción de elegir entre mirilla clásica, de punto o el cursor por defecto.
- **Tabla de récords**: guarda tus mejores marcas al jugar en dificultad Difícil mediante una base de datos en Neon.
- **Aviso para móviles**: como requiere precisión de ratón, si entras desde el móvil o pantalla pequeña verás un aviso claro indicando que solo está disponible en ordenador.

### 3. Próximos lanzamientos

La plataforma está pensada para seguir sumando nuevos minijuegos y experimentos interactivos con el tiempo.

---

## Cómo ejecutar el proyecto en tu equipo

### 1. Descargar el código

```bash
git clone https://github.com/alejandroandresbermejo1/aabverse.git
cd aabverse/aabverse_frontend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Arrancar el servidor de desarrollo

```bash
pnpm start
```

Entra en tu navegador en `http://localhost:4200/` para ver la aplicación funcionando.

### 4. Generar la versión de producción

```bash
pnpm run build
```

Los archivos optimizados y listos para publicar se generarán dentro de la carpeta `dist/`.

---

## Aviso legal y privacidad

AABVerse es un proyecto personal con fines didácticos y de ocio, sin ánimo de lucro ni fines comerciales.
