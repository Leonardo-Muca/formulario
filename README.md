# Formulario de Ofertas - Prueba Técnica

Este proyecto es una solución que integra una aplicación móvil desarrollada con **Expo (React Native)** y una **API REST** construida con **Node.js, Express y TypeScript** para el registro de ofertas con campos dinámicos y carga de archivos multimedia.

## Estructura del Proyecto

*   `api/`: Backend REST API (Node.js + Express + TypeScript)
    *   `src/index.ts`: Servidor Express, carga de archivos mediante Multer y enrutamiento.
    *   `src/schemas/itemSchema.ts`: Validaciones de negocio con Zod.
    *   `public/uploads/`: Directorio donde se almacenan las fotos/videos subidos.
*   `mobile/`: Aplicación móvil (Expo SDK 51+)
    *   `App.tsx`: Punto de entrada que renderiza la vista principal.
    *   `styles/theme.ts`: Tokens de diseño para estilos (colores, espaciados).
    *   `hooks/useOfferForm.ts`: Manejo del formulario, validación local con Zod y envío de red.
    *   `components/`: Componentes UI reutilizables (DatePicker, MediaPicker, FormField, OfferForm).

---

## Decisiones de Implementación

1.  **Carga de archivos mediante XMLHttpRequest (XHR)**:
    En las versiones recientes de Expo, la implementación interna del cliente de `fetch` de React Native (WinterCG) presenta problemas de serialización de objetos de tipo archivo en peticiones de tipo `FormData` y arroja errores al intentar crear Blobs a partir de URIs locales en modo de depuración. Se optó por usar `XMLHttpRequest` nativo de React Native, el cual interactúa directamente con los módulos de red nativos (iOS/Android) y permite transferir el archivo directamente desde el almacenamiento local sin cargarlo completamente en memoria.
2.  **Limpieza Automática en el Servidor**:
    Si la validación de los datos de negocio falla en la API, el servidor elimina de inmediato cualquier archivo multimedia recibido temporalmente por Multer para evitar almacenamiento huérfano.
3.  **Separación de Responsabilidades**:
    La lógica de negocio, validaciones y peticiones se encuentra encapsulada en el hook `useOfferForm.ts`. La capa de presentación (`OfferForm.tsx`) solo se encarga de renderizar la UI y reaccionar al estado provisto por el hook.

---

## Requisitos Previos

*   **Node.js**: Versión v20 o superior instalada.
*   **Expo Go**: Aplicación instalada en el dispositivo móvil si deseas probar en hardware real.
*   **Conexión de Red**: Para probar la app en un teléfono físico, tanto la computadora como el teléfono deben estar conectados a la misma red local.

---

## Ejecución del Proyecto

### 1. Levantar el Backend (API)

1.  Navegar al directorio del servidor:
    ```bash
    cd api
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Iniciar el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```
    *La API estará disponible en http://localhost:3000.*

### 2. Levantar la App Móvil (Expo)

1.  Abrir otra terminal y navegar al directorio `mobile`:
    ```bash
    cd mobile
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Iniciar el servidor de desarrollo:
    *   **En simuladores locales (iOS / Android)**:
        ```bash
        npx expo start --localhost
        ```
        *   Presiona `i` para iOS o `a` para Android.
    *   **En dispositivo físico (Expo Go)**:
        1.  Obtén la dirección IP local de tu máquina de desarrollo.
        2.  Edita la constante `API_URL` en `mobile/hooks/useOfferForm.ts` colocando tu IP en lugar de `localhost` (ej: `http://192.168.1.50:3000/api/items`).
        3.  Ejecuta:
            ```bash
            npx expo start
            ```
        4.  Escanea el código QR generado usando la aplicación de cámara de iOS o la aplicación de Expo Go en Android.
