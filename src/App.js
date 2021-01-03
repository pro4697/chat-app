import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import firebase from 'firebase';
import './App.css';

import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

import { setUser, clearUser } from './redux/actions/user_action';

function App(props) {
	const history = useHistory();
	const dispatch = useDispatch();
	const isLoading = useSelector((state) => state.user.isLoading);

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				dispatch(setUser(user));
				history.push('/');
			} else {
				dispatch(clearUser());
				history.push('/login');
			}
		});
	}, []);

	return (
		<React.Fragment>
			{isLoading && <div>Loading...</div>}
			{!isLoading && (
				<Switch>
					<Route exact path='/' component={ChatPage} />
					<Route exact path='/login' component={LoginPage} />
					<Route exact path='/register' component={RegisterPage} />
				</Switch>
			)}
		</React.Fragment>
	);
}

export default App;
