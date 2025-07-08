import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQKQbRtvvPsuNlCHE0LVGWDyjJfq7hK90",
  authDomain: "bytechat-ffb7c.firebaseapp.com",
  projectId: "bytechat-ffb7c",
  storageBucket: "bytechat-ffb7c.appspot.com",
  messagingSenderId: "681650489425",
  appId: "1:681650489425:web:665f37d73fe8c8ca201070",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
