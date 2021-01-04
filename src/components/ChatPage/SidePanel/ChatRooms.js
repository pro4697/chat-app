import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { RiChat3Fill } from 'react-icons/ri';
import firebase from '../../../firebase';
import { setCurrentChatRoom, setChatRoomType } from '../../../redux/actions/chatRoom_action';

export class ChatRooms extends Component {
	state = {
		show: false,
		firstLoad: true,
		name: '',
		description: '',
		chatRoomsRef: firebase.database().ref('chatRooms'),
		messagesRef: firebase.database().ref('messages'),
		chatRooms: [],
		activeChatRoomId: '',
		notifications: [], // [방의정보(chatRooms), 알림정보(notifications)] chatRoom과 인덱스 공유
	};

	componentDidMount() {
		this.AddChatRoomListeners();
	}

	componentWillUnmount() {
		this.state.chatRoomsRef.off();
		this.state.chatRooms.forEach((chatRoom) => {
			this.state.messagesRef.child(chatRoom.id).off();
		});
	}

	setFirstChatRoom = () => {
		const firstChatRoom = this.state.chatRooms[0];

		// 처음 페이지 로딩시 0번째 채팅방을 현재 채팅방으로 지정
		if (this.state.firstLoad && this.state.chatRooms.length > 0) {
			this.props.dispatch(setCurrentChatRoom(firstChatRoom));
			this.setState({ activeChatRoomId: firstChatRoom.id });
		}
		this.setState({ firstLoad: false });
	};

	AddChatRoomListeners = () => {
		let chatRoomList = [];

		// 채팅방이 추가되면 즉시 적용
		this.state.chatRoomsRef.on('child_added', (DataSnapshot) => {
			chatRoomList.push(DataSnapshot.val());
			this.setState({ chatRooms: chatRoomList }, () => this.setFirstChatRoom());
			this.addNotificationListener(DataSnapshot.key);
		});
	};

	addNotificationListener = (chatRoomId) => {
		this.state.messagesRef.child(chatRoomId).on('value', (DataSnapshot) => {
			if (this.props.chatRoom) {
				this.handleNotifications(chatRoomId, this.props.chatRoom.id, this.state.notifications, DataSnapshot);
			}
		});
	};

	handleNotifications = (chatRoomId, currentChatRoomId, notifications, DataSnapshot) => {
		// 이미 알림정보가 들어있는 방과 아닌 채팅방 구분
		let index = notifications.findIndex((notification) => notification.id === chatRoomId);

		// chatRoomId에 해당하는 채팅방의 알림 정보가 없을때
		if (index === -1) {
			notifications.push({
				id: chatRoomId,
				total: DataSnapshot.numChildren(), // 총 메시지 갯수
				lastKnownTotal: DataSnapshot.numChildren(), // 마지막으로 확인한 메시지 갯수
				count: 0, // 알림 벳지에 표시할 메시지 갯수
			});
		}
		// 이미 해당 채팅방의 알림 정보가 있을때
		else {
			// 현재 접속한 방 이외에서 메시지가 올때
			if (chatRoomId !== currentChatRoomId) {
				// 현재까지 유저가 확인한 총 메시지 개수
				let lastTotal = notifications[index].lastKnownTotal;

				// count (알림으로 보여줄 숫자)
				// 현재 총 메시지 개수 - 이전에 확인한 총 메시지 개수 > 0
				if (DataSnapshot.numChildren() - lastTotal > 0) {
					notifications[index].count = DataSnapshot.numChildren() - lastTotal;
				}
			}
			// total property에 현재 전체 미시지 개수 넣기
			notifications[index].total = DataSnapshot.numChildren();
		}
		this.setState({ notifications });
	};

	handleClose = () => this.setState({ show: false });

	handleShow = () => this.setState({ show: true });

	handleSubmit = (e) => {
		e.preventDefault();

		const { name, description } = this.state;

		if (this.isFormValid(name, description)) {
			this.addChatRoom();
		}
	};

	addChatRoom = async () => {
		// 유일한 키값을 받아옴
		const key = this.state.chatRoomsRef.push().key;
		const { name, description } = this.state;
		const { user } = this.props;
		const newChatRoom = {
			id: key,
			name: name,
			description: description,
			createdBy: {
				name: user.displayName,
				image: user.photoURL,
			},
		};

		try {
			await this.state.chatRoomsRef.child(key).update(newChatRoom);
			this.setState({
				name: '',
				description: '',
				show: false,
			});
		} catch (error) {
			alert(error);
		}
	};

	isFormValid = (name, description) => name && description;

	changeChatRoom = (room) => {
		this.props.dispatch(setCurrentChatRoom(room));
		this.props.dispatch(setChatRoomType('public'));
		this.setState({ activeChatRoomId: room.id });
		this.clearNotifications(room);
	};

	clearNotifications = (room) => {
		let index = this.state.notifications.findIndex((notification) => notification.id === room.id);

		if (index !== -1) {
			let updatedNotifications = [...this.state.notifications];
			updatedNotifications[index].lastKnownTotal = this.state.notifications[index].total;
			updatedNotifications[index].count = 0;
			this.setState({ notifications: updatedNotifications });
		}
	};

	getNotificationCount = (room) => {
		// 해당 채팅방의 count수 구하기
		let count;

		this.state.notifications.forEach((notification) => {
			if (notification.id === room.id) {
				count = notification.count;
			}
		});

		if (count > 0) {
			return count;
		}
	};

	renderChatRooms = (chatRooms) => {
		return (
			chatRooms.length > 0 &&
			chatRooms.map((room) => (
				<li
					onClick={() => this.changeChatRoom(room)}
					key={room.id}
					style={{
						backgroundColor:
							room.id === this.state.activeChatRoomId && this.props.chatRoomType === 'public' && '#ffffff45',
						marginLeft: '10px',
						paddingLeft: '10px',
						borderRadius: '5px',
						cursor: 'pointer',
					}}
				>
					{`# ${room.name}`}
					<Badge style={{ float: 'right', marginTop: '3px', marginRight: '2px' }} variant='danger'>
						{this.getNotificationCount(room)}
					</Badge>
				</li>
			))
		);
	};

	render() {
		return (
			<div>
				<div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
					<RiChat3Fill style={{ marginRight: '3px' }} />
					CHAT ROOMS {`(${this.state.chatRooms.length})`}
					<FaPlus onClick={this.handleShow} style={{ position: 'absolute', right: '0', cursor: 'pointer' }} />
				</div>

				<ul style={{ listStyleType: 'none', padding: 0 }}>{this.renderChatRooms(this.state.chatRooms)}</ul>

				{/* 채팅창 추가 modal */}
				<Modal show={this.state.show} onHide={this.handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>채팅방 생성</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form>
							<Form.Group controlId=''>
								<Form.Label>방 이름</Form.Label>
								<Form.Control
									onChange={(e) => this.setState({ name: e.target.value })}
									type='text'
									placeholder='Enter a chat room name'
								/>
							</Form.Group>
							<Form.Group controlId=''>
								<Form.Label>방 설명</Form.Label>
								<Form.Control
									onChange={(e) => this.setState({ description: e.target.value })}
									type='text'
									placeholder='Enter a chat room description'
								/>
							</Form.Group>
						</Form>
					</Modal.Body>
					<Modal.Footer>
						<Button variant='secondary' onClick={this.handleClose}>
							취소
						</Button>
						<Button variant='primary' onClick={this.handleSubmit}>
							생성하기
						</Button>
					</Modal.Footer>
				</Modal>
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

export default connect(mapStateToProps)(ChatRooms);
