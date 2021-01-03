import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FaRegSmile } from 'react-icons/fa';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';
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
		let usersList = [];

		usersRef.on('child_added', (DataSnapshot) => {
			if (currentUserId !== DataSnapshot.key) {
				let user = DataSnapshot.val();
				user['uid'] = DataSnapshot.key;
				user['status'] = 'offline';
				usersList.push(user);
				this.setState({ users: usersList });
			}
		});
	};

	getChatRoomId = (targetUserId) => {
		const currentUserId = this.props.user.uid;
		return targetUserId > currentUserId ? `${targetUserId}/${currentUserId}` : `${currentUserId}/${targetUserId}`;
	};

	changeChatRoom = (user) => {
		const chatRoomId = this.getChatRoomId(user.uid);
		const chatRoomData = {
			id: chatRoomId,
			name: user.name,
		};
		this.props.dispatch(setCurrentChatRoom(chatRoomData));
		this.props.dispatch(setPrivateChatRoom(true));
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
				style={{ backgroundColor: user.uid === this.state.activeChatRoom && this.props.isPrivate && '#ffffff45' }}
				key={user.uid}
			>
				# {user.name}
			</li>
		));

	render() {
		const { users } = this.state;
		return (
			<div>
				<span style={{ display: 'flex', alignItems: 'center' }}>
					<FaRegSmile style={{ marginRight: '3px' }} /> DIRECT MESSAGES (1)
				</span>
				<ul style={{ listStyleType: 'none', padding: 0 }}>{this.renderDirectMessages(users)}</ul>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user.currentUser,
		isPrivate: state.chatRoom.isPrivateChatRoom,
	};
};

export default connect(mapStateToProps)(DirectMessage);
