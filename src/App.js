import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import firebase from 'firebase';
import './App.css';

import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

function App(props) {
	let history = useHistory();

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			console.log('user', user);

			// 로그인이 된 상태
			if (user) {
				history.push('/');
			} else {
				history.push('/login');
			}
		});
	}, []);

	return (
		<Switch>
			<Route exact path='/' component={ChatPage} />
			<Route exact path='/login' component={LoginPage} />
			<Route exact path='/register' component={RegisterPage} />
		</Switch>
	);
}

export default App;
