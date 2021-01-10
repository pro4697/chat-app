import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RiChatPrivateFill } from 'react-icons/ri';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setChatRoomType } from '../../../redux/actions/chatRoom_action';
export class DirectMessage extends Component {
	state = {
		users: [],
		usersRef: firebase.database().ref('users'),
		activeChatRoom: '',
	};

	componentDidMount() {
		if (this.props.user && this.props.user.uid) {
			this.addUsersListeners(this.props.user.uid);
		}
	}

	addUsersListeners = async (currentUserId) => {
		const { usersRef } = this.state;

		await usersRef.once('value').then((data) => {
			let userId = [...Object.keys(data.val())];
			let userData = [...Object.values(data.val())];
			userData = userData
				.map((user, i) => {
					return { ...user, uid: userId[i] };
				})
				.filter((user) => user.uid !== currentUserId);

			this.setState({ users: userData });
		});

		usersRef.on('child_changed', (DataSnapshot) => {
			if (currentUserId !== DataSnapshot.key) {
				let usersList = [...this.state.users];
				let user = DataSnapshot.val();
				let index = usersList.findIndex((user) => user.uid === DataSnapshot.key);
				if (index !== -1) {
					usersList[index].status = user.status;
				} else {
					user['uid'] = DataSnapshot.key;
					usersList.push(user);
				}
				this.setState({ users: usersList });
			}
		});
	};

	getChatRoomId = (targetUserId) => {
		const currentUserId = this.props.user.uid;
		return targetUserId > currentUserId
			? `${targetUserId}/${currentUserId}`
			: `${currentUserId}/${targetUserId}`;
	};

	changeChatRoom = (user) => {
		const chatRoomId = this.getChatRoomId(user.uid);
		const chatRoomData = {
			id: chatRoomId,
			name: user.name,
		};
		this.props.dispatch(setCurrentChatRoom(chatRoomData));
		this.props.dispatch(setChatRoomType('private'));
		this.setActiveChatRoom(user.uid);
	};

	setActiveChatRoom = (userId) => {
		this.setState({ activeChatRoom: userId });
	};

	renderDirectMessages = (users) =>
		users.length > 0 &&
		users.map((user) => (
			<li
				onClick={() => this.changeChatRoom(user)}
				style={{
					backgroundColor:
						user.uid === this.state.activeChatRoom &&
						this.props.chatRoomType === 'private' &&
						'#ffffff45',
					marginLeft: '10px',
					paddingLeft: '10px',
					borderRadius: '5px',
					cursor: 'pointer',
				}}
				key={user.uid}
			>
				<div
					style={{
						display: 'inline-block',
						backgroundColor: user.status === 'online' ? '#31a24c' : 'darkRed',
						width: '10px',
						height: '10px',
						borderRadius: '10px',
						marginRight: '5px',
					}}
				/>
				{user.name}
			</li>
		));

	render() {
		const { users } = this.state;
		return (
			<div>
				<span style={{ display: 'flex', alignItems: 'center' }}>
					<RiChatPrivateFill style={{ marginRight: '3px' }} /> DIRECT MESSAGES
				</span>
				<ul style={{ listStyleType: 'none', padding: 0 }}>{this.renderDirectMessages(users)}</ul>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user.currentUser,
		chatRoomType: state.chatRoom.chatRoomType,
	};
};

export default connect(mapStateToProps)(DirectMessage);
