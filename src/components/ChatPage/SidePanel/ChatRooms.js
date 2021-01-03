import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { FaRegSmileWink, FaPlus } from 'react-icons/fa';
import firebase from 'firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

export class ChatRooms extends Component {
	state = {
		show: false,
		firstLoad: true,
		name: '',
		description: '',
		chatRoomsRef: firebase.database().ref('chatRooms'),
		chatRooms: [],
		activeChatRoomId: '',
	};

	componentDidMount() {
		this.AddChatRoomListeners();
	}

	componentWillUnmount() {
		this.state.chatRoomsRef.off();
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
		});
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
		this.props.dispatch(setPrivateChatRoom(false));
		this.setState({ activeChatRoomId: room.id });
	};

	renderChatRooms = (chatRooms) =>
		chatRooms.length > 0 &&
		chatRooms.map((room) => (
			<li
				onClick={() => this.changeChatRoom(room)}
				key={room.id}
				style={{ backgroundColor: room.id === this.state.activeChatRoomId && !this.props.isPrivate && '#ffffff45' }}
			>
				# {room.name}
			</li>
		));

	render() {
		return (
			<div>
				<div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
					<FaRegSmileWink style={{ marginRight: '3px' }} />
					CHAT ROOMS (1)
					<FaPlus onClick={this.handleShow} style={{ position: 'absolute', right: '0', cursor: 'pointer' }} />
				</div>

				<ul style={{ listStyleType: 'none', padding: 0 }}>{this.renderChatRooms(this.state.chatRooms)}</ul>

				{/* 채팅탕 추가 modal */}
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
		isPrivate: state.chatRoom.isPrivateChatRoom,
	};
};

export default connect(mapStateToProps)(ChatRooms);
