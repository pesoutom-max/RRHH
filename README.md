# App de Reclutamiento con Firebase

Aplicación web de reclutamiento para una empresa pequeña en Chile, construida con Next.js, Firebase Authentication, Firestore, Storage y Cloud Functions.

## Arquitectura general

- `src/app`: rutas públicas y privadas.
- `src/components`: componentes reutilizables del sitio público y del panel admin.
- `src/lib/firebase`: inicialización y servicios Firebase.
- `src/lib/validations`: validaciones de formulario y RUT.
- `shared`: tipos de datos y scoring reutilizable.
- `functions`: notificaciones automáticas y lógica backend serverless.

## Modelo de datos implementado

### `vacancies`
- `title`
- `slug`
- `description`
- `responsibilities`
- `requirements`
- `schedule`
- `location`
- `salary`
- `status`
- `createdAt`
- `updatedAt`

### `applications`
- `vacancyId`
- `vacancyTitle`
- `fullName`
- `rut`
- `phone`
- `email`
- `comuna`
- `age`
- `address`
- `experienceSummary`
- `lastJob`
- `availability`
- `canWorkWeekends`
- `canStartImmediately`
- `hasFoodHandlingExperience`
- `hasCustomerServiceExperience`
- `transportToWork`
- `expectedSalary`
- `motivation`
- `strengths`
- `weaknesses`
- `cvFileUrl`
- `answers`
- `score`
- `status`
- `adminNotes`
- `consentAccepted`
- `appliedAt`
- `updatedAt`

### `admin_users`
- `name`
- `email`
- `role`
- `createdAt`

### `notifications_log`
- `applicationId`
- `type`
- `sentTo`
- `sentAt`
- `status`
- `errorMessage`

## Variables de entorno requeridas

### App web
Crear `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
ADMIN_BOOTSTRAP_SECRET=
```

### Cloud Functions con Brevo
Configurar en `functions/.env` o como secrets/variables de Firebase:

```env
ADMIN_NOTIFICATION_EMAIL=pesoutom@gmail.com
BREVO_API_KEY=
BREVO_SENDER_EMAIL=pesoutom@gmail.com
BREVO_SENDER_NAME=Link App
```

`BREVO_SENDER_EMAIL` es opcional si quieres usar el mismo correo definido en `ADMIN_NOTIFICATION_EMAIL` como remitente y destinatario de las notificaciones.

Antes de enviar correos desde Brevo, verifica el remitente o el dominio dentro de Brevo Transactional.

## Flujo de seguridad

- Lectura de `applications`: solo admin.
- Creación pública de `applications`: permitida solo con la estructura exacta del formulario.
- `vacancies` activas: públicas.
- `admin_users`: lectura propia y gestión admin.
- `notifications_log`: privado.

## Cómo probar paso a paso

1. Instala dependencias del proyecto raíz y de `functions`.
2. Crea un proyecto Firebase y conecta `firebase use --add`.
3. Activa Firestore, Authentication con Email/Password y Storage.
4. Completa `.env.local`.
5. Crea un usuario administrador en Firebase Authentication.
6. Registra ese usuario en `admin_users` usando `POST /api/admin/bootstrap`.
7. Configura Brevo y define `BREVO_API_KEY` y `ADMIN_NOTIFICATION_EMAIL` en Functions.
   - Si usarás `pesoutom@gmail.com` para todo, puedes copiar `functions/.env.example` a `functions/.env` y pegar la API key.
8. Despliega reglas:
   - `firebase deploy --only firestore:rules,storage`
9. Instala dependencias en `functions` y despliega funciones:
   - `cd functions && npm install`
   - `firebase deploy --only functions`
10. Levanta la app:
   - `npm install`
   - `npm run dev`
11. Ingresa al panel en `/login`, crea una vacante y valida el flujo público postulando desde `/`.
