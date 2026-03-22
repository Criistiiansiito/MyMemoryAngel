const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin inicializado');
} catch (err) {
  console.error('No se pudo inicializar Firebase Admin. ¿Tienes serviceAccountKey.json?', err.message);
  process.exit(1);
}

module.exports = admin;
