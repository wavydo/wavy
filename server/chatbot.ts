// Chatbot Logic for Support System
export interface FAQOption {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ_OPTIONS: FAQOption[] = [
  // Pagos y Transacciones
  {
    id: 'payment-failed',
    question: 'Mi pago fue rechazado',
    answer: 'Si tu pago fue rechazado, puede deberse a:\n\n• Fondos insuficientes\n• Tarjeta vencida o bloqueada\n• Límites de gasto excedidos\n\nTe recomiendo verificar con tu banco e intentar nuevamente.',
    category: 'payments'
  },
  {
    id: 'refund-request',
    question: '¿Cómo solicito un reembolso?',
    answer: 'Para solicitar un reembolso:\n\n1. Ve a Historial de transacciones\n2. Selecciona la transacción\n3. Toca "Solicitar reembolso"\n4. Describe el motivo\n\nProcesamos reembolsos en 3-5 días hábiles.',
    category: 'payments'
  },
  {
    id: 'transaction-history',
    question: 'No veo mi transacción',
    answer: 'Si no ves una transacción:\n\n• Actualiza la app (desliza hacia abajo)\n• Verifica que hayas iniciado sesión\n• Revisa la fecha del filtro\n\nLas transacciones aparecen en tiempo real.',
    category: 'payments'
  },
  
  // Tarjeta NFC
  {
    id: 'nfc-not-working',
    question: 'Mi tarjeta NFC no funciona',
    answer: 'Si tu tarjeta NFC no funciona:\n\n• Verifica que el NFC esté activado\n• Acerca la tarjeta al teléfono (máx 3cm)\n• Asegúrate de que esté vinculada en la app\n• Limpia el chip con un paño suave\n\nPrueba con otro establecimiento para confirmar.',
    category: 'nfc'
  },
  {
    id: 'activate-card',
    question: '¿Cómo activo mi tarjeta?',
    answer: 'Para activar tu tarjeta TAPP:\n\n1. Ve a "Mi Tarjeta"\n2. Toca "Vincular tarjeta"\n3. Acerca tu tarjeta al teléfono\n4. Confirma los datos\n\nTu tarjeta está activa y lista para usar.',
    category: 'nfc'
  },
  {
    id: 'lost-card',
    question: 'Perdí mi tarjeta',
    answer: 'Si perdiste tu tarjeta:\n\n1. Ve a "Mi Tarjeta" en la app\n2. Toca "Bloquear tarjeta"\n3. Solicita un reemplazo\n\nPuedes seguir usando la app para pagos mientras llega tu nueva tarjeta.',
    category: 'nfc'
  },
  
  // Establecimientos
  {
    id: 'find-establishments',
    question: '¿Dónde puedo usar TAPP?',
    answer: 'Puedes usar TAPP en todos nuestros establecimientos afiliados:\n\n• Usa el mapa en la pestaña "Explorar"\n• Filtra por categoría (restaurantes, cafés, etc.)\n• Verifica el descuento disponible\n\nMás de 500 establecimientos esperándote.',
    category: 'establishments'
  },
  {
    id: 'discounts-info',
    question: '¿Cómo funcionan los descuentos?',
    answer: 'Los descuentos TAPP:\n\n• Se aplican automáticamente al pagar\n• Varían por establecimiento (5%-25%)\n• Son acumulables con promociones\n• Sin límite de uso\n\nMientras más usas, más ahorras.',
    category: 'establishments'
  },
  
  // Cuenta y Perfil
  {
    id: 'reset-password',
    question: 'Olvidé mi contraseña',
    answer: 'Para recuperar tu contraseña:\n\n1. En login, toca "¿Olvidaste tu contraseña?"\n2. Ingresa tu email\n3. Revisa tu correo (también spam)\n4. Sigue el enlace para crear nueva contraseña\n\nEl enlace expira en 1 hora.',
    category: 'account'
  },
  {
    id: 'update-profile',
    question: '¿Cómo actualizo mi perfil?',
    answer: 'Para actualizar tu perfil:\n\n1. Ve a la pestaña "Perfil"\n2. Toca el ícono de editar\n3. Modifica los campos que desees\n4. Guarda los cambios\n\nPuedes cambiar: nombre, email, teléfono y foto.',
    category: 'account'
  },
  {
    id: 'delete-account',
    question: '¿Cómo elimino mi cuenta?',
    answer: 'Para eliminar tu cuenta:\n\n1. Ve a Perfil → Configuración\n2. Desplázate hasta el final\n3. Toca "Eliminar cuenta"\n4. Confirma la acción\n\nEsta acción es irreversible y eliminará todos tus datos.',
    category: 'account'
  },
  
  // Seguridad
  {
    id: 'secure-account',
    question: '¿Es seguro TAPP?',
    answer: 'Tu seguridad es nuestra prioridad:\n\n• Encriptación end-to-end\n• Autenticación de dos factores disponible\n• Datos bancarios nunca almacenados\n• Monitoreo 24/7 contra fraudes\n• Certificación PCI DSS Nivel 1\n\nTus datos están protegidos.',
    category: 'security'
  },
  {
    id: 'suspicious-activity',
    question: 'Vi actividad sospechosa',
    answer: 'Si detectas actividad sospechosa:\n\n1. Bloquea tu tarjeta inmediatamente\n2. Cambia tu contraseña\n3. Contacta soporte con los detalles\n4. Revisa tu historial de transacciones\n\nInvestigamos todos los casos en 24 horas.',
    category: 'security'
  },
  
  // App y Técnico
  {
    id: 'app-crashes',
    question: 'La app se cierra sola',
    answer: 'Si la app se cierra inesperadamente:\n\n• Actualiza a la última versión\n• Reinicia tu dispositivo\n• Verifica espacio de almacenamiento\n• Reinstala la app si persiste\n\nRequisitos: iOS 13+ o Android 8+',
    category: 'technical'
  },
  {
    id: 'update-app',
    question: '¿Cómo actualizo la app?',
    answer: 'Para actualizar TAPP:\n\niOS:\n1. Abre App Store\n2. Busca "TAPP"\n3. Toca "Actualizar"\n\nAndroid:\n1. Abre Play Store\n2. Busca "TAPP"\n3. Toca "Actualizar"\n\nLas actualizaciones incluyen mejoras y nuevas funciones.',
    category: 'technical'
  },
];

// UUID especial para el bot
export const BOT_UUID = '00000000-0000-0000-0000-000000000001';

// Detectar si el usuario quiere hablar con un humano
export function detectHumanRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  const humanKeywords = [
    'humano', 'persona', 'alguien', 'operador', 'agente',
    'representante', 'asistencia', 'ayuda de', 'hablar con',
    'contactar', 'comunicar', 'real', 'verdadero', 'staff',
    'soporte', 'atención al cliente', 'servicio al cliente'
  ];
  
  return humanKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Mensaje de bienvenida del bot
export const WELCOME_MESSAGE = `Hola, soy el asistente virtual de TAPP.

¿En qué puedo ayudarte hoy? Selecciona una opción o escríbeme tu consulta:`;

// Mensaje de transferencia a humano
export const HANDOFF_MESSAGE = `Entiendo que necesitas ayuda personalizada.

Un miembro de nuestro equipo de soporte te atenderá en breve. Típicamente respondemos en menos de 5 minutos.

Gracias por tu paciencia.`;

// Mensaje después de 3 respuestas negativas
export const ESCALATION_MESSAGE = `Veo que las respuestas automáticas no han resuelto tu problema.

Te estoy conectando con un agente de soporte humano que podrá ayudarte mejor.

Por favor espera un momento...`;
