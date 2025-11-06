# 🤖 Ana - WhatsApp Bot de Full Queso

Sistema automatizado de atención al cliente post-venta para Full Queso mediante WhatsApp.

## 📋 Descripción

Ana es un bot inteligente que:
- Envía mensajes automáticos después de entregas
- Recopila feedback sobre productos y servicio
- Mantiene conversaciones naturales en español venezolano
- Guarda toda la información en base de datos para análisis

## 🏗️ Arquitectura

```
Firebase Functions (Cloud)
├── procesarSeguimientos (ejecuta cada 1 minuto)
│   └── Busca órdenes ENTREGADO → Envía template WhatsApp
└── whatsappWebhook (recibe respuestas)
    └── Cliente responde → Claude AI genera respuesta → Guarda en BD

Twilio WhatsApp Business
└── Template aprobado: anajensy_order_followup

Anthropic Claude AI
└── Modelo: claude-sonnet-4-20250514

Firestore Database
├── pedidos_bot (órdenes)
├── clientes_bot (perfiles)
├── conversaciones_bot (historial)
└── encuestas_postventa (feedback + sentiment analysis)
```

## 🚀 Configuración Inicial

### Requisitos
- Node.js 22+
- Firebase CLI instalado
- Cuenta Twilio con WhatsApp Business
- API Key de Anthropic (Claude)

### Instalación

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd anajensy-bot-functions

# Instalar dependencias
cd functions
npm install

# Login a Firebase
firebase login

# Seleccionar proyecto
firebase use fullqueso-bot
```

## 📦 Despliegue

```bash
# Deploy a producción
firebase deploy --only functions

# Ver logs en tiempo real
firebase functions:log --only procesarSeguimientos
```

## 🧪 Pruebas

### Crear orden de prueba
```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node create-order-churros.js
```

## 📊 Colecciones Firestore

- **pedidos_bot**: Órdenes de clientes
- **clientes_bot**: Perfiles de clientes  
- **conversaciones_bot**: Historial de conversaciones
- **encuestas_postventa**: Feedback y sentiment analysis

## 🎭 Personalidad de Ana

- Venezolana cálida y expresiva
- Usa modismos venezolanos naturales
- Empática y profesional
- Mensajes de 25-40 palabras

### Flujo de Conversación Post-Venta (3 mensajes)
1. Template inicial → Cliente responde
2. Mensaje 1: Reacción + Pregunta sobre PRODUCTO
3. Mensaje 2: Pregunta sobre DELIVERY
4. Mensaje 3: Agradecimiento + Solicitud de EMAIL + Recordatorio de fullqueso.com

### Comunicación Two-Way (Fuera de Post-Venta)

Cuando un cliente escribe sin seguimiento activo o después de completar la encuesta:

**Para nuevos pedidos:**
- Dirige a fullqueso.com
- Ejemplo: "Hola, ¡con gusto! Para hacer tu pedido entra a fullqueso.com, es súper fácil. Para cualquier ayuda escríbenos al +584241476748. ¡Saludos!"

**Para consultas o reclamos:**
- Dirige a WhatsApp de atención: +584241476748
- O email: atencionalcliente@fullqueso.com
- Ejemplo: "Hola, entiendo. Para atenderte mejor, escríbenos al +584241476748 o a atencionalcliente@fullqueso.com. Te ayudaremos enseguida. Un abrazo"

**Escenarios manejados:**
- Cliente inicia conversación sin pedido reciente
- Cliente escribe después de completar encuesta
- Cliente saluda o consulta fuera del flujo post-venta
- Solicitudes de nuevos pedidos, reclamos o ayuda general

## 🔐 Seguridad

- ✅ Secrets en Firebase Secret Manager
- ✅ Service account keys NO en repo
- ✅ .gitignore configurado

## 🗄️ Backups

### Backup Automático
- **Frecuencia:** Cada domingo a las 2:00 AM (Caracas)
- **Destino:** Google Cloud Storage
- **Retención:** 8 semanas
- **Colecciones:** pedidos_bot, clientes_bot, conversaciones_bot, encuestas_postventa

```bash
# Ver logs de backups
firebase functions:log --only backupFirestore

# Listar backups en Cloud Storage
gsutil ls -l gs://fullqueso-bot.appspot.com/backups/
```

### Backup Manual
```bash
cd functions
GCLOUD_PROJECT=fullqueso-bot node backup-firestore.js
```

### Restauración
```bash
# Descargar backup desde Cloud Storage
gsutil -m cp -r gs://fullqueso-bot.appspot.com/backups/2025-11-06 ./restore/

# Restaurar
cd functions
GCLOUD_PROJECT=fullqueso-bot node restore-firestore.js ./restore/2025-11-06
```

Ver documentación completa: [BACKUP_GUIDE.md](BACKUP_GUIDE.md)

## 📈 Monitoreo

Firebase Console: https://console.firebase.google.com/project/fullqueso-bot

## 📝 Changelog

### 2025-11-06
- ✅ Sistema de backup automático implementado
- ✅ Backup cada domingo a las 2:00 AM
- ✅ Retención automática de 8 semanas
- ✅ Script de restauración completo
- ✅ Ana menciona fullqueso.com en mensaje final
- ✅ Comunicación two-way inteligente implementada
- ✅ Redirección automática para pedidos → fullqueso.com
- ✅ Redirección para consultas → +584241476748 / atencionalcliente@fullqueso.com
- ✅ Detección automática de contexto (post-venta vs consulta general)
- Ana más expresiva con emociones
- Flujo de 3 mensajes estructurado
- Template Meta aprobado
- Estado VERIFICADO → ENTREGADO

### 2025-11-05  
- Límite 30-40 palabras
- Sentiment analysis
- Email capture

## 📄 Licencia

Propiedad de Full Queso. Todos los derechos reservados.
