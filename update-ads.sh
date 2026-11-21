#!/bin/bash

# Script para actualizar las imágenes de publicidad
# Uso: ./update-ads.sh

echo "📢 Actualizando imágenes de publicidad..."

# Copiar imágenes desde tapp-mobile al servidor
cp ../tapp-mobile/assets/publicidadapp/pub1.png server/public/ads/pub1.png
cp ../tapp-mobile/assets/publicidadapp/pub2.png server/public/ads/pub2.png
cp ../tapp-mobile/assets/publicidadapp/pub3.png server/public/ads/pub3.png

echo "✅ Imágenes actualizadas en server/public/ads/"
echo ""
echo "Las nuevas imágenes se mostrarán automáticamente cuando los usuarios:"
echo "  1. Deslicen hacia abajo (pull-to-refresh) en la app"
echo "  2. Reinicien la app"
echo ""
echo "No es necesario reiniciar el servidor."
