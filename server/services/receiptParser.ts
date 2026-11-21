import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ParsedReceipt {
  items: ReceiptItem[];
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  currency: string;
  merchantName: string | null;
  date: string | null;
  rawText: string;
}

/**
 * Parser inteligente de facturas usando Tesseract.js
 * Extrae items, precios, subtotal, impuestos, propinas y total
 */
export class ReceiptParser {
  /**
   * Pre-procesa la imagen para mejorar la calidad del OCR
   */
  private static async preprocessImage(imagePath: string): Promise<string> {
    try {
      console.log('🎨 Pre-processing image for better OCR...');
      
      const processedPath = imagePath.replace(/\.(jpg|jpeg|png|heic)$/i, '_processed.png');
      
      // Pre-procesamiento agresivo para facturas de impresora térmica
      await sharp(imagePath)
        .rotate() // Auto-rotar basado en EXIF
        .resize(3000, null, { // Aumentar resolución significativamente
          fit: 'inside',
          withoutEnlargement: false,
          kernel: sharp.kernel.lanczos3 // Mejor algoritmo de escalado
        })
        .grayscale() // Convertir a escala de grises
        .linear(1.5, -(128 * 0.5)) // Aumentar contraste agresivamente
        .normalize() // Normalizar niveles
        .median(3) // Reducir ruido
        .sharpen({ sigma: 2 }) // Aumentar nitidez más agresivamente
        .threshold(140) // Binarización más agresiva
        .negate({ alpha: false }) // Invertir si es necesario
        .negate({ alpha: false }) // Volver a invertir (prueba)
        .png({ compressionLevel: 0 }) // Sin compresión para máxima calidad
        .toFile(processedPath);
      
      console.log('✅ Image pre-processed:', processedPath);
      return processedPath;
    } catch (error) {
      console.error('⚠️  Error pre-processing image, using original:', error);
      return imagePath; // Si falla, usar imagen original
    }
  }

  /**
   * Procesa una imagen de factura y extrae la información estructurada
   */
  static async parseReceipt(imagePath: string): Promise<ParsedReceipt> {
    let processedImagePath = imagePath;
    
    try {
      console.log('🔍 Starting OCR process with OCR.space API...');
      
      // Pre-procesar imagen
      processedImagePath = await this.preprocessImage(imagePath);
      
      // Leer imagen como base64
      const imageBuffer = fs.readFileSync(processedImagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Usar OCR.space API (gratis con API key pública)
      console.log('📤 Sending image to OCR.space...');
      const formData = new FormData();
      formData.append('base64Image', `data:image/png;base64,${base64Image}`);
      formData.append('language', 'spa');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // Engine 2 es mejor para facturas
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'helloworld',
        },
        body: formData as any,
      });

      const result = await response.json();
      console.log('📥 OCR.space response:', JSON.stringify(result, null, 2));

      if (!result.IsErroredOnProcessing && result.ParsedResults && result.ParsedResults.length > 0) {
        const text = result.ParsedResults[0].ParsedText;
        console.log('✅ OCR completed successfully');
        console.log('Raw text length:', text.length, 'characters');
        console.log('Raw text:\n' + text);

        // Parsear el texto extraído
        const parsed = this.parseReceiptText(text);
        
        // Limpiar imagen procesada
        if (processedImagePath !== imagePath && fs.existsSync(processedImagePath)) {
          fs.unlinkSync(processedImagePath);
          console.log('🗑️  Cleaned up processed image');
        }
        
        return parsed;
      } else {
        console.error('❌ OCR.space error:', result.ErrorMessage || result.ErrorDetails);
        throw new Error('OCR processing failed');
      }
    } catch (error) {
      console.error('❌ Error parsing receipt:', error);
      
      // Limpiar imagen procesada en caso de error
      if (processedImagePath !== imagePath && fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }
      
      throw new Error('Failed to parse receipt');
    }
  }

  /**
   * Parsea el texto extraído por OCR y estructura la información
   */
  private static parseReceiptText(text: string): ParsedReceipt {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const items: ReceiptItem[] = [];
    let subtotal: number | null = null;
    let tax: number | null = null;
    let tip: number | null = null;
    let total: number | null = null;
    let merchantName: string | null = null;
    let date: string | null = null;

    // Detectar nombre del comercio (generalmente en las primeras líneas)
    if (lines.length > 0) {
      merchantName = lines[0].trim();
    }

    // Detectar fecha
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (dateMatch) {
      date = dateMatch[1];
    }

    // Patrones mejorados para detectar precios (con o sin separadores de miles)
    // Detecta: 1,234.56 o 1234.56 o 1.234,56 o 1234,56
    const pricePattern = /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b|\b\d+[.,]\d{2}\b/g;
    
    const subtotalPattern = /(?:subtotal|sub\s*total)[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;
    const taxPattern = /(?:tax|impuesto|itbis|iva)[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;
    const tipPattern = /(?:tip|propina|gratuity|gratificaci[oó]n)[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;
    const totalPattern = /(?:total|suma|monto)[\s:]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i;

    // Extraer subtotal, tax, tip, total
    const subtotalMatch = text.match(subtotalPattern);
    if (subtotalMatch) {
      subtotal = this.parsePrice(subtotalMatch[1]);
      console.log('💰 Subtotal found:', subtotal);
    }

    const taxMatch = text.match(taxPattern);
    if (taxMatch) {
      tax = this.parsePrice(taxMatch[1]);
      console.log('💰 Tax found:', tax);
    }

    const tipMatch = text.match(tipPattern);
    if (tipMatch) {
      tip = this.parsePrice(tipMatch[1]);
      console.log('💰 Tip found:', tip);
    }

    const totalMatch = text.match(totalPattern);
    if (totalMatch) {
      total = this.parsePrice(totalMatch[1]);
      console.log('💰 Total found:', total);
    }

    // Extraer items individuales - estrategia mejorada
    console.log('🔍 Scanning lines for items...');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Saltar líneas vacías o muy cortas
      if (line.length < 3) continue;
      
      // Saltar líneas que son totales o encabezados conocidos
      if (
        /^(?:subtotal|sub\s*total|tax|tip|total|propina|impuesto|itbis|iva|gratuity|suma|monto|cambio|pago|efectivo|tarjeta|credito|debito|devoluci[oó]n)/i.test(line)
      ) {
        console.log('⏭️  Skipping header/total line:', line);
        continue;
      }

      // Buscar todos los precios en la línea
      const prices = line.match(pricePattern);
      
      if (prices && prices.length > 0) {
        console.log('💵 Line with prices:', line, '→ Prices:', prices);
        
        // Obtener el texto antes del primer precio (nombre del item)
        const firstPriceIndex = line.search(pricePattern);
        let itemName = line.substring(0, firstPriceIndex).trim();
        
        // Limpiar el nombre del item
        itemName = itemName
          .replace(/^\d+\s*[xX×]\s*/i, '') // Remover cantidades como "2x" al inicio
          .replace(/^[\d\s]+/, '') // Remover números solos al inicio
          .replace(/[^\w\sáéíóúñÁÉÍÓÚÑ]/g, ' ') // Limpiar caracteres especiales
          .trim();
        
        // Solo agregar si el nombre tiene sentido (más de 2 caracteres alfabéticos)
        if (itemName.length >= 2 && /[a-záéíóúñ]/i.test(itemName)) {
          // El último precio en la línea generalmente es el total del item
          const itemPrice = this.parsePrice(prices[prices.length - 1]);
          
          // Validar que el precio sea razonable (entre $0.10 y $100,000)
          if (itemPrice >= 0.10 && itemPrice <= 100000) {
            // Detectar cantidad si existe (ej: "2x Pizza")
            const quantityMatch = line.match(/(\d+)\s*[xX×]/i);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
            
            // Calcular precio unitario
            const unitPrice = quantity > 1 ? itemPrice / quantity : itemPrice;
            
            const item = {
              name: itemName,
              quantity,
              price: unitPrice,
              totalPrice: itemPrice
            };
            
            console.log('✅ Item extracted:', item);
            items.push(item);
          } else {
            console.log('⚠️  Price out of range, skipping:', itemPrice);
          }
        } else {
          console.log('⚠️  Item name too short or invalid:', itemName);
        }
      }
    }

    console.log(`\n📦 Total items extracted: ${items.length}`);

    // Si no se detectó el subtotal, calcularlo desde los items
    if (!subtotal && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      console.log('💰 Calculated subtotal from items:', subtotal);
    }

    // Si no se detectó el total, calcularlo
    if (!total) {
      total = (subtotal || 0) + (tax || 0) + (tip || 0);
      console.log('💰 Calculated total:', total);
    }

    // Detectar moneda (RD$ para República Dominicana)
    const currency = text.includes('RD$') || text.includes('RD') || text.includes('DOP') ? 'RD$' : '$';

    const result = {
      items,
      subtotal,
      tax,
      tip,
      total,
      currency,
      merchantName,
      date,
      rawText: text
    };

    console.log('\n✅ Receipt parsed successfully');
    console.log('   Items:', items.length);
    console.log('   Total:', currency + (total?.toFixed(2) || '0.00'));

    return result;
  }

  /**
   * Convierte string de precio a número
   */
  private static parsePrice(priceStr: string): number {
    // Normalizar: remover separadores de miles y convertir coma decimal a punto
    const normalized = priceStr.replace(/,(\d{3})/g, '$1').replace(',', '.');
    return parseFloat(normalized);
  }

  /**
   * Valida y limpia el resultado parseado
   */
  static validateAndClean(parsed: ParsedReceipt): ParsedReceipt {
    // Filtrar items con precios sospechosos (muy altos o muy bajos)
    const cleanedItems = parsed.items.filter(item => {
      return item.totalPrice > 0 && item.totalPrice < 100000; // Max RD$100,000 por item
    });

    // Recalcular subtotal si hay discrepancia
    const calculatedSubtotal = cleanedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (parsed.subtotal && Math.abs(calculatedSubtotal - parsed.subtotal) > 10) {
      console.warn('⚠️ Subtotal mismatch detected, using calculated value');
      parsed.subtotal = calculatedSubtotal;
    }

    return {
      ...parsed,
      items: cleanedItems
    };
  }
}
