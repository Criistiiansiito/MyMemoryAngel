const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

try {
  // PRODUCCIÓN (Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } 
  // LOCAL
  else {
    const filePath = path.join(__dirname, 'serviceAccountKey.json');

    if (!fs.existsSync(filePath)) {
      throw new Error('No existe serviceAccountKey.json en local');
    }

    serviceAccount = require(filePath);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin inicializado');
} catch (err) {
  console.error('Error inicializando Firebase Admin:', err.message);
  process.exit(1);
}

module.exports = admin;