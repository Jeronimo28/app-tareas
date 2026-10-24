# Cómo publicar "Gestor de Tareas" en Google Play

La app es una PWA alojada en GitHub Pages (`https://jeronimo28.github.io/app-tareas/`).
Se publica en Google Play como **Trusted Web Activity (TWA)**: un APK/AAB pequeño que abre
la web a pantalla completa. Cuando actualizas la web, la app se actualiza sola.

## 0. Antes de empezar

- [ ] Fusiona estos cambios en la rama que publica GitHub Pages y comprueba que
      `https://jeronimo28.github.io/app-tareas/` carga y funciona **sin conexión**
      (modo avión, después de abrirla una vez).
- [ ] Edita `privacidad.html` y cambia `TU_CORREO_DE_CONTACTO` por tu correo.
      URL de la política: `https://jeronimo28.github.io/app-tareas/privacidad.html`
- [ ] Crea una cuenta de desarrollador en <https://play.google.com/console>
      (pago único de 25 USD y verificación de identidad).

## 1. Generar el paquete Android con PWABuilder

1. Entra en <https://www.pwabuilder.com> y pega `https://jeronimo28.github.io/app-tareas/`.
2. Revisa la puntuación (manifest, service worker); no debería haber errores bloqueantes.
3. Pulsa **Package for stores → Android → Generate Package**. Opciones recomendadas:
   - **Package ID**: `io.github.jeronimo28.tareas` (no se puede cambiar después).
   - **App name**: `Gestor de Tareas`, **Short name**: `Tareas`.
   - **Signing key**: "Create new" (o "Use mine" si ya tienes una).
4. Descarga el ZIP. Contiene:
   - `app-release-bundle.aab` → lo que se sube a Google Play.
   - `app-release-signed.apk` → para probar en tu móvil.
   - `signing.keystore` + `signing-key-info.txt` → **GUÁRDALOS en un lugar seguro y
     privado. NO los subas a este repositorio.** Sin ellos no podrás publicar actualizaciones.
   - `assetlinks.json` → ver paso 2.

## 2. Quitar la barra de direcciones (Digital Asset Links)

Para que la app se abra sin la barra del navegador, Android tiene que encontrar
`assetlinks.json` en la **raíz del dominio**:

`https://jeronimo28.github.io/.well-known/assetlinks.json`

Como `app-tareas` es un sitio de proyecto, ese archivo **no puede vivir en este repo**. Opciones:

- **A (recomendada, gratis):** crea el repo `jeronimo28/jeronimo28.github.io`, activa GitHub
  Pages en él y añade:
  - `.nojekyll` (vacío, para que se publique la carpeta `.well-known`)
  - `.well-known/assetlinks.json` con el contenido que generó PWABuilder.
- **B:** usar un dominio propio para la app y poner ahí el archivo.

Importante: tras subir la app, Google Play la firma con **su propia clave**. Ve a
Play Console → *Prueba y lanzamiento → Configuración → Integridad de la app → Firma de apps*,
copia la huella **SHA-256** de la "clave de firma de apps" y añádela también al array
`sha256_cert_fingerprints` de `assetlinks.json` (deja también la de tu clave de subida).

Comprobación: <https://developers.google.com/digital-asset-links/tools/generator>

## 3. Crear la app en Play Console

1. **Crear app** → nombre "Gestor de Tareas", idioma español, App, Gratis.
2. Completa **Configura tu app** (panel principal):
   - Política de privacidad: la URL de `privacidad.html`.
   - Acceso a la app: todas las funciones disponibles sin restricciones.
   - Anuncios: no contiene anuncios.
   - Clasificación de contenido: cuestionario (resultará "Para todos").
   - Público objetivo: mayores de 13 (o 18) para evitar requisitos de apps infantiles.
   - Seguridad de los datos: **no se recopilan ni comparten datos**.
   - Categoría: Productividad.
3. **Ficha de Play Store**:
   - Descripción breve (máx. 80 caracteres) y descripción completa.
   - Icono 512×512 → `icon-512.png`.
   - Gráfico de funciones 1024×500 (créalo en Canva o similar).
   - Al menos 2 capturas de pantalla del móvil.

## 4. Pruebas y publicación

- Las **cuentas personales nuevas** deben hacer primero una **prueba cerrada con al menos
  12 testers durante 14 días seguidos** antes de poder pedir acceso a producción.
  (Las cuentas de organización no tienen este requisito.)
- Sube `app-release-bundle.aab` en *Prueba cerrada* → crea versión → envía a revisión.
- Pasados los 14 días, solicita acceso a **Producción** y publica.

## 5. Actualizaciones

- Cambios en HTML/CSS/JS: basta con hacer push a GitHub Pages. Sube el número de
  `CACHE_NAME` en `sw.js` para que los usuarios reciban la versión nueva.
- Solo hace falta un AAB nuevo si cambias nombre, icono, colores o el paquete Android:
  vuelve a generarlo en PWABuilder **con la misma keystore** y un *version code* mayor.
