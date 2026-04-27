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
app.use('/api/auth', authRoutes);
app.use('/api/recordatorios', authRoutes);
app.use('/api/chatbot', authRoutes);
app.use('/api/musica', authRoutes);
app.use('/api/lecturas', authRoutes);
app.use('/api/escritura', authRoutes);
app.use('/api/vinculaciones', authRoutes);

iniciarCron();

// Arrancar servidor en IP local
const PORT = process.env.API_PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));