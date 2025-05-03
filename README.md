# Hey Jack

![Hey Jack Logo](https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80)

Hey Jack es una plataforma que ayuda a padres a organizar colectas para cumpleaños y eventos de manera eficiente a través de WhatsApp.

## 📋 Descripción

Hey Jack resuelve el problema de organizar colectas grupales para cumpleaños de hijos, profesores y otros eventos. Mediante un asistente de IA en WhatsApp, automatiza todo el proceso de recaudación, seguimiento y compra de regalos.

### Características principales

- **Organización simplificada**: Crea colectas en minutos
- **Seguimiento automático**: Recordatorios y control de pagos
- **Transparencia total**: Todos los participantes pueden ver el estado de la colecta
- **Integración con WhatsApp**: Funciona en la plataforma que ya usas a diario
- **Recomendación de regalos**: Encuentra el regalo perfecto según el presupuesto

## 🚀 Tecnologías

Este proyecto está desarrollado con:

- **Frontend**: React + Material-UI
- **Backend**: FastAPI
- **Integración**: Twilio (WhatsApp)
- **Base de datos**: PostgreSQL

## 📁 Estructura del proyecto

```
Hey Jack/
├── public/                # Archivos estáticos
│   ├── images/            # Imágenes estáticas
│   ├── index.html         # HTML principal
│   └── manifest.json      # Manifest para PWA
├── src/
│   ├── assets/            # Recursos (imágenes, etc.)
│   ├── components/        # Componentes reutilizables
│   │   ├── HeroSection.js
│   │   ├── ProblemSolution.js
│   │   ├── HowItWorks.js
│   │   ├── Benefits.js
│   │   ├── GiftSection.js
│   │   ├── Testimonials.js
│   │   ├── FAQ.js
│   │   ├── FinalCTA.js
│   │   └── Footer.js
│   ├── pages/             # Páginas principales
│   │   ├── LandingPage.js
│   │   ├── CreateCommunity.js
│   │   └── JoinCommunity.js
│   ├── styles/            # Estilos globales
│   │   └── index.css
│   ├── utils/             # Utilidades y configuraciones
│   ├── App.js             # Componente principal
│   └── index.js           # Punto de entrada
├── backend/               # Backend FastAPI (en desarrollo)
├── package.json           # Dependencias y scripts
└── README.md              # Documentación
```

## 🏁 Cómo iniciar el proyecto

### Requisitos previos

- Node.js (v14 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/hey-jack.git
   cd hey-jack
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   # o
   yarn start
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Flujo de usuario

1. **Landing Page**: El usuario conoce Hey Jack y sus beneficios
2. **Crear Comunidad**: Proceso de 3 pasos para crear una colecta
   - Paso 1: Crear (datos básicos)
   - Paso 2: Completar (monto y detalles)
   - Paso 3: Compartir (invitar participantes)
3. **Unirse a Comunidad**: Proceso para unirse a una colecta existente
4. **Gestión de la Colecta**: Seguimiento, recordatorios y finalización

## 🔜 Próximas funcionalidades

- Integración completa con WhatsApp
- Panel de administración para organizadores
- Más opciones de personalización
- Integración con más plataformas de e-commerce
- Análisis y estadísticas de colectas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👥 Equipo

Desarrollado con ❤️ por el equipo de Hey Jack.
