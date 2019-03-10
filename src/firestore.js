import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

const config = {
    apiKey: 'AIzaSyDe8mlwCePLeJ5yAwDRe7iWMb15y1M-o_o',
    authDomain: 'vasagatantracker-spektrumrf.firebaseapp.com',
    databaseURL: 'https://vasagatantracker-spektrumrf.firebaseio.com',
    projectId: 'vasagatantracker-spektrumrf',
    storageBucket: 'vasagatantracker-spektrumrf.appspot.com',
    messagingSenderId: '118507293956'
};

firebase.initializeApp(config);

let db;

const setAppYear = (year) => {
    db = firebase.firestore().collection('years').doc(year.toString());
};

const getAuth = () => {
    return firebase.auth();
};

const getStorage = () => {
    return firebase.storage();
};

const getDatabase = () => {
    return db;
};

const getCollection = (name) => {
    return db.collection(name);
};

const getProperties = () => {
    return firebase.firestore().collection('properties');
};

const getYears = () => {
    return firebase.firestore().collection('years');
};

export default { getDatabase, getCollection, setAppYear, getAuth, getProperties, getYears, getStorage };