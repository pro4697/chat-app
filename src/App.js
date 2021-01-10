import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import firebase from './firebase';
import './App.css';

import ChatPage from './components/ChatPage/ChatPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

import { setUser, clearUser } from './redux/actions/user_action';

function App() {
	const history = useHistory();
	const dispatch = useDispatch();
	const isLoading = useSelector((state) => state.user.isLoading);
	const currentUser = useSelector((state) => state.user.currentUser);
	const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				dispatch(setUser(user));

				// 회원가입시 auth 업데이트 시간차로 인해 접근 거절 문제를 방지
				setTimeout(() => {
					firebase.database().ref('users').child(user.uid).update({ status: 'online' });
				}, 3000);
				history.push('/');
			} else {
				dispatch(clearUser());
				history.push('/login');
			}
		});
	}, []);

	// 브라우저 종료시 유저상태 offline
	window.addEventListener('beforeunload', () => {
		if (chatRoom && currentUser) {
			firebase.database().ref('users').child(currentUser.uid).update({ status: 'offline' });
			firebase.database().ref('typing').child(chatRoom.id).child(currentUser.uid).remove();
		}
	});

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
