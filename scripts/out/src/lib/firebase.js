"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.auth = exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const auth_1 = require("firebase/auth");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    // These will be configured by the user
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
exports.auth = (0, auth_1.getAuth)(app);
if (process.env.NODE_ENV === "development") {
    // Conecta a los emuladores locales de Firebase
    (0, firestore_1.connectFirestoreEmulator)(exports.db, "localhost", 8080);
    (0, auth_1.connectAuthEmulator)(exports.auth, "http://localhost:9099");
}
exports.storage = (0, storage_1.getStorage)(app);
exports.default = app;
