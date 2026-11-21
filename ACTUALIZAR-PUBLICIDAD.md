# 📢 Cómo Actualizar las Imágenes de Publicidad

## Método 1: Reemplazar directamente (Más rápido)

1. Ve a la carpeta: `tradearray-fukushima/server/public/ads/`
2. Reemplaza los archivos:
   - `pub1.png`
   - `pub2.png`
   - `pub3.png`
3. ¡Listo! No necesitas reiniciar el servidor

Los usuarios verán las nuevas imágenes automáticamente cuando:
- Deslicen hacia abajo (pull-to-refresh) en la app
- Reinicien la app

---

## Método 2: Actualizar desde tapp-mobile (Opcional)

Si quieres mantener las imágenes sincronizadas con `tapp-mobile/assets/publicidadapp/`:

1. Actualiza las imágenes en: `tapp-mobile/assets/publicidadapp/`
   - pub1.png
   - pub2.png
   - pub3.png

2. Ejecuta el script de sincronización:
   ```bash
   cd tradearray-fukushima
   ./update-ads.sh
   ```

---

## Notas Técnicas

- Las imágenes se sirven desde: `http://10.0.0.224:3001/api/ads/pub1.png`
- Sin caché: Las imágenes se recargan en cada pull-to-refresh
- Timestamp automático: Cada refresh agrega `?t=timestamp` para evitar caché del navegador
- Tamaño recomendado: Las imágenes actuales son ~350KB-700KB cada una

---

## Verificar que funcionó

1. Abre la app móvil
2. Ve al dashboard (pantalla principal)
3. Desliza hacia abajo para hacer refresh
4. Las nuevas imágenes deberían aparecer en el carrusel inferior

Si no aparecen:
- Verifica que el servidor esté corriendo en el puerto 3001
- Verifica que las imágenes existan en `server/public/ads/`
- Verifica los permisos de los archivos (deben ser legibles)
