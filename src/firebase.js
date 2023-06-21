// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCo5hOw6tGikc0Gh4HVCyL6kVxt624B8Qo",
  authDomain: "proiect-licenta-517ec.firebaseapp.com",
  projectId: "proiect-licenta-517ec",
  storageBucket: "gs://proiect-licenta-517ec.appspot.com",
  messagingSenderId: "42087554237",
  appId: "1:42087554237:web:f69ed4ee24c57a8f60abd4",
  measurementId: "G-BEH55V8RMD",
  databaseURL: "https://proiect-licenta-517ec-default-rtdb.firebaseio.com/"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const database = getDatabase(app);

const storage = getStorage(app);

export default database;