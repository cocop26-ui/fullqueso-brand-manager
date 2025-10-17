# Full Queso Admin Dashboard

Panel de administración web para gestionar clientes, pedidos y conversaciones del bot Anajensy.

## 📋 Características

- ✅ Autenticación segura con Firebase Authentication
- ✅ Panel de administración en tiempo real
- ✅ Visualización de clientes, pedidos y conversaciones
- ✅ Búsqueda y filtrado de datos
- ✅ Exportación a CSV
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Estadísticas en tiempo real

## 🚀 Configuración e Instalación

### Paso 1: Configurar Firebase Authentication

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **fullqueso-bot**
3. En el menú lateral, ve a **Authentication** > **Get Started**
4. Habilita el método de inicio de sesión **Email/Password**:
   - Click en "Email/Password"
   - Activa el toggle
   - Click en "Save"

### Paso 2: Crear Usuario Administrador

Tienes dos opciones:

**Opción A: Usando Firebase Console (Recomendado)**
1. En Firebase Console, ve a **Authentication** > **Users**
2. Click en **Add User**
3. Ingresa:
   - Email: `admin@fullqueso.com` (o el email que prefieras)
   - Password: (crea una contraseña segura)
4. Click en **Add User**

**Opción B: Usando Firebase CLI**
```bash
firebase auth:import users.json --project fullqueso-bot
```

### Paso 3: Obtener Configuración de Firebase

1. En Firebase Console, ve a **Project Settings** (ícono de engranaje)
2. Baja hasta **Your apps** > **Web apps**
3. Si no tienes una app web, click en **Add app** (ícono </>)
4. Registra tu app con el nombre "Admin Dashboard"
5. Copia la configuración que aparece (firebaseConfig)

### Paso 4: Configurar el Proyecto

1. Abre el archivo `public/js/firebase-config.js`
2. Reemplaza los valores placeholder con tu configuración:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "fullqueso-bot.firebaseapp.com",
  projectId: "fullqueso-bot",
  storageBucket: "fullqueso-bot.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### Paso 5: Instalar Firebase CLI

Si no lo tienes instalado:

```bash
npm install -g firebase-tools
```

Inicia sesión:

```bash
firebase login
```

### Paso 6: Desplegar Firestore Security Rules

Las reglas de seguridad protegen tu base de datos:

```bash
cd admin-dashboard
firebase deploy --only firestore:rules
```

### Paso 7: Desplegar el Dashboard

Despliega el sitio web a Firebase Hosting:

```bash
firebase deploy --only hosting
```

Después del despliegue, verás la URL de tu dashboard:
```
✔  Deploy complete!
Hosting URL: https://fullqueso-bot.web.app
```

## 🔐 Acceso al Dashboard

1. Abre tu navegador y ve a: `https://fullqueso-bot.web.app`
2. Inicia sesión con las credenciales del usuario administrador que creaste
3. Serás redirigido automáticamente al dashboard

## 📱 Uso del Dashboard

### Sección: Clientes
- Visualiza todos los clientes registrados
- Busca por nombre, teléfono o cédula
- Exporta la lista a CSV

### Sección: Pedidos
- Visualiza todos los pedidos
- Filtra por estado (VERIFICADO, ENTREGADO, PENDIENTE)
- Ve detalles de productos y montos
- Verifica si el seguimiento fue enviado

### Sección: Conversaciones
- Visualiza todas las conversaciones de Anajensy
- Filtra por sentimiento (positivo, neutral, negativo)
- Identifica conversaciones que requieren atención
- Lee mensajes entre Ana y los clientes

## 🛠️ Desarrollo Local

Para probar localmente antes de desplegar:

```bash
cd admin-dashboard

# Iniciar Firebase Emulators
firebase emulators:start

# O usar un servidor local simple
python3 -m http.server 8000 --directory public
```

Luego abre: `http://localhost:8000`

**Nota:** Para desarrollo local, asegúrate de usar la configuración real de Firebase (no emulators) en `firebase-config.js`.

## 🔒 Seguridad

### Firestore Security Rules

Las reglas implementadas (`firestore.rules`) garantizan que:
- Solo usuarios autenticados pueden leer datos
- Los datos solo pueden ser modificados por Cloud Functions (no por el dashboard)
- Protección contra acceso no autorizado

### Mejoras de Seguridad Futuras

Para un entorno de producción, considera:

1. **Roles de Usuario:** Implementar custom claims para diferentes niveles de acceso
2. **IP Allowlist:** Restringir acceso por IP en Firebase Hosting
3. **Auditoría:** Registrar acciones de administradores
4. **2FA:** Habilitar autenticación de dos factores

## 📊 Estructura del Proyecto

```
admin-dashboard/
├── public/
│   ├── index.html              # Página de login
│   ├── dashboard.html          # Dashboard principal
│   ├── css/
│   │   └── styles.css          # Estilos
│   └── js/
│       ├── firebase-config.js  # Configuración Firebase
│       ├── auth.js             # Lógica de autenticación
│       └── dashboard.js        # Lógica del dashboard
├── firebase.json               # Configuración de Firebase Hosting
├── firestore.rules            # Reglas de seguridad Firestore
├── .firebaserc                # Proyecto Firebase
└── README.md                  # Este archivo
```

## 🐛 Solución de Problemas

### Error: "Permission denied"
- Verifica que las Firestore rules estén desplegadas
- Verifica que el usuario esté autenticado correctamente

### Error: "Firebase config not found"
- Asegúrate de haber actualizado `firebase-config.js` con tus credenciales reales

### No se muestran datos
- Verifica que las colecciones `clientes_bot`, `pedidos_bot` y `conversaciones_bot` tengan datos
- Revisa la consola del navegador (F12) para ver errores

### No puedo iniciar sesión
- Verifica que Firebase Authentication esté habilitado
- Verifica que el usuario exista en Firebase Console > Authentication

## 📞 Soporte

Para problemas o preguntas:
1. Revisa los logs en Firebase Console > Firestore > Usage
2. Revisa la consola del navegador (F12 > Console)
3. Verifica que todas las configuraciones estén correctas

## 🎯 Próximos Pasos

Mejoras futuras sugeridas:
- [ ] Agregar gráficos y analytics
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar capacidad de responder a conversaciones desde el dashboard
- [ ] Crear reportes automáticos
- [ ] Implementar roles de usuario (admin, operador, viewer)

## 📄 Licencia

© 2025 Full Queso. Todos los derechos reservados.
