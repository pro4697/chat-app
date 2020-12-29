import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
	apiKey: 'AIzaSyAhmG9iBsvBXvxffk-c7oZUTAYDBrkIRE4',
	authDomain: 'chat-app-d86d1.firebaseapp.com',
	projectId: 'chat-app-d86d1',
	storageBucket: 'chat-app-d86d1.appspot.com',
	messagingSenderId: '942097472171',
	appId: '1:942097472171:web:eecf337923c0748d6335ee',
	measurementId: 'G-1BZV10SCMD',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export default firebase;
