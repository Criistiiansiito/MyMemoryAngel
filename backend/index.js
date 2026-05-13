const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: '../.env' })

const app = express();
const { iniciarCron } = require('./notificationsWorker');

app.use(cors({ origin: true }));
app.use(express.json());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para log de headers (debug)
app.use((req, res, next) => {
  next();
});

// Rutas
const authRoutes = require('./routes/auth');
const internalRoutes = require('./routes/internal');
const recordatoriosRoutes = require('./routes/recordatorios');
const lecturasRoutes = require('./routes/lecturas');
const escrituraRoutes = require('./routes/escritura');
const perfilRoutes = require('./routes/perfil');
const vinculacionesRoutes = require('./routes/vinculaciones');
const musicaRoutes = require('./routes/musica');
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/recordatorios', recordatoriosRoutes);
app.use('/api/chatbot', authRoutes);
app.use('/api/musica', musicaRoutes);
app.use('/api/lecturas', lecturasRoutes);
app.use('/api/escritura', escrituraRoutes);
app.use('/api/vinculaciones', vinculacionesRoutes);
app.use('/api/internal', internalRoutes);

if (process.env.CRON_ENABLED !== 'false') {
  iniciarCron();
} else {
  console.log('Cron desactivado por CRON_ENABLED=false');
}

// Arrancar servidor en IP local
const PORT = process.env.API_PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
