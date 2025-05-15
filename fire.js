import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_ENV_API_KEY,
  authDomain: import.meta.env.VITE_ENV_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_ENV_DATABASE_URL,
  projectId: import.meta.env.VITE_ENV_PROJECTID,
  storageBucket: import.meta.env.VITE_ENV_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_ENV_MESSAGING_SENDERID,
  appId: import.meta.env.VITE_ENV_APPID,
  measurementId: import.meta.env.VITE_ENV_MEASUREMENTID
};

// Check if all required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.databaseURL ||
    !firebaseConfig.projectId || !firebaseConfig.storageBucket || !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId || !firebaseConfig.measurementId) {
  console.error("Error: Missing Firebase configuration values. Ensure all environment variables are set.");
}

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

async function logVisitorInfo() {
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();

    const locationRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const locationData = await locationRes.json();

    const visitorRef = ref(db, 'visitors');
    const newVisitor = push(visitorRef);
    
    await set(newVisitor, {
      ip,
      city: locationData.city,
      region: locationData.region,
      country: locationData.country_name,
      org: locationData.org,
      timestamp: new Date().toISOString()
    });

    console.log("Visitor logged:", ip);
  } catch (err) {
    console.error("Logging failed:", err);
  }
}

logVisitorInfo();