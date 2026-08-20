/* =========================================================
   Firebase initialization
   Realtime Database backs the "Equipment Checking" records
   (state.DATA in script.js) so entries persist across
   reloads/devices instead of resetting on every page load.
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyA_IWWkjY4Ae-l2yY3mfGsMPc7D0PXd6wI",
  authDomain: "it-monitoring-368ef.firebaseapp.com",
  databaseURL: "https://it-monitoring-368ef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "it-monitoring-368ef",
  storageBucket: "it-monitoring-368ef.firebasestorage.app",
  messagingSenderId: "269124711420",
  appId: "1:269124711420:web:aaba7ab366e969f0593879",
  measurementId: "G-D7LXVSLBQD"
};

firebase.initializeApp(firebaseConfig);

/* Global handle used by script.js */
const equipmentRef = firebase.database().ref("equipmentChecks");
