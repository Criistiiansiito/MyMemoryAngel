const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware para log de headers (debug)
app.use((req, res, next) => {
  console.log('Headers recibidos:', req.headers);
  next();
});

// Rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/recordatorios', authRoutes);
app.use('/api/chatbot', authRoutes);

// Arrancar servidor en IP local
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
