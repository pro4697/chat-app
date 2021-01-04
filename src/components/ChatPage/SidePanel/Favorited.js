import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Badge } from 'react-bootstrap';
import { AiFillStar } from 'react-icons/ai';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setChatRoomType } from '../../../redux/actions/chatRoom_action';

export class Favorited extends Component {
	state = {
		favoritedChatRooms: [],
		usersRef: firebase.database().ref('users'),
		activeChatRoomId: '',
	};

	componentDidMount() {
		if (this.props.user) {
			this.addListeners(this.props.user.uid);
		}
	}

	componentWillUnmount() {
		if (this.props.user) {
			this.removeListener(this.props.user.uid);
		}
	}

	removeListener = (userId) => {
		this.state.usersRef.child(`${userId}/favorited`).ofF();
	};

	addListeners = (userId) => {
		const { usersRef } = this.state;

		usersRef
			.child(userId)
			.child('favorited')
			.on('child_added', (DataSnapshot) => {
				const favoritedChatRoom = { id: DataSnapshot.key, ...DataSnapshot.val() };
				this.setState({ favoritedChatRooms: [...this.state.favoritedChatRooms, favoritedChatRoom] });
			});

		usersRef
			.child(userId)
			.child('favorited')
			.on('child_removed', (DataSnapshot) => {
				const chatRoomToRomove = { id: DataSnapshot.key, ...DataSnapshot.val() };
				const filteredChatRooms = this.state.favoritedChatRooms.filter(
					(chatRoom) => chatRoom.id !== chatRoomToRomove.id
				);
				this.setState({ favoritedChatRooms: filteredChatRooms });
			});
	};

	changeChatRoom = (room) => {
		this.props.dispatch(setCurrentChatRoom(room));
		this.props.dispatch(setChatRoomType('favorited'));
		this.setState({ activeChatRoomId: room.id });
		//this.clearNotifications(room);
	};

	renderFavoritedChatRooms = (favoritedChatRooms) => {
		return (
			favoritedChatRooms.length > 0 &&
			favoritedChatRooms.map((room) => (
				<li
					onClick={() => this.changeChatRoom(room)}
					key={room.id}
					style={{
						backgroundColor:
							room.id === this.state.activeChatRoomId && this.props.chatRoomType === 'favorited' && '#ffffff45',
						marginLeft: '10px',
						paddingLeft: '10px',
						borderRadius: '5px',
						cursor: 'pointer',
					}}
				>
					{`# ${room.name}`}
					{/* <Badge style={{ float: 'right', marginTop: '3px', marginRight: '2px' }} variant='danger'>
						{this.getNotificationCount(room)}
					</Badge> */}
				</li>
			))
		);
	};

	render() {
		const { favoritedChatRooms } = this.state;
		return (
			<div>
				<span style={{ display: 'flex', alignItems: 'center' }}>
					<AiFillStar style={{ marginRight: '3px' }} />
					FAVORITED {`(${this.state.favoritedChatRooms.length})`}
				</span>
				<ul style={{ listStyleType: 'none', padding: '0' }}>{this.renderFavoritedChatRooms(favoritedChatRooms)}</ul>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user.currentUser,
		chatRoom: state.chatRoom.currentChatRoom,
		chatRoomType: state.chatRoom.chatRoomType,
	};
};

export default connect(mapStateToProps)(Favorited);
