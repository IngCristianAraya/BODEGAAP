"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../src/lib/firebase");
async function createUserDoc({ uid, name, email, companyId, role = 'admin' }) {
    await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'users', uid), {
        name,
        email,
        companyId,
        role,
        createdAt: new Date()
    });
    console.log('Documento creado en /users/' + uid);
}
// USO: Edita estos valores con los datos de tu usuario actual:
const uid = '<AQUÍ_TU_UID>';
const name = 'Admin';
const email = 'admin@demo.com';
const companyId = 'empresa-demo';
createUserDoc({ uid, name, email, companyId }).then(() => process.exit(0));
