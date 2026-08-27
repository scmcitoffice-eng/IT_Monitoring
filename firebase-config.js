/* ==========================================================
   Firebase connection setup
   Loaded as a <script type="module"> so it can use the
   Firebase CDN ESM builds directly — no bundler/build step
   required, which matters since this project deploys to
   Vercel as a static site (no package.json/build command).
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";

// NOTE: Firebase *client* config values (apiKey, authDomain, etc.) are not
// secret — they identify your project, they don't authorize access.
// Actual security is enforced by your Realtime Database security rules.
// It's safe for this to live in a static file deployed to Vercel.
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

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Analytics only works in a real browser context (and Firebase's own check
// can fail silently in some embeds/ad-blockers), so guard it.
analyticsIsSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp);
});

// Expose on window so the existing non-module script.js (loaded after this
// one) can read from it once you're ready to wire in live data.
window.firebaseApp = firebaseApp;
window.firebaseDb = db;

// script.js is a classic (non-module) script, so it can't `import` from the
// Firebase SDK directly. Hand it the handful of database functions it needs
// via window instead, so it can persist STATE across reloads.
window.fbRef = ref;
window.fbGet = get;
window.fbSet = set;
window.fbChild = child;

// Fires once this module has finished running, so script.js (or you, in
// devtools) can reliably know the connection is ready.
window.dispatchEvent(new CustomEvent("firebase-ready", { detail: { db } }));
