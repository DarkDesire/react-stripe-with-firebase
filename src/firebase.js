import firebase from 'firebase'
var firebaseConfig = {
    apiKey: "AIzaSyC2pe01Hu4zt5l0dxUrVXRKPkoiqMLZSA8",
    authDomain: "reactstripe-d0444.firebaseapp.com",
    projectId: "reactstripe-d0444",
    storageBucket: "reactstripe-d0444.appspot.com",
    messagingSenderId: "82941585725",
    appId: "1:82941585725:web:302e857383cedbf4f67d54"

};
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
export { auth };
export default db;