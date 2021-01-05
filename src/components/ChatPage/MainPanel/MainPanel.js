import React, { Component } from 'react';
import { connect } from 'react-redux';
import MessageHeader from './MessageHeader';
import Message from './Message';
import MessageForm from './MessageForm';
import firebase from '../../../firebase';
import { setUserPosts } from '../../../redux/actions/chatRoom_action';
import Skeleton from '../../../commons/components/Skeleton';

export class MainPanel extends Component {
	messageEndRef = React.createRef();

	state = {
		messages: [],
		messagesRef: firebase.database().ref('messages'),
		messagesLoading: true,
		searchTerm: '',
		searchResults: [],
		searchLoading: false,
		typingRef: firebase.database().ref('typing'),
		typingUsers: [],
		listenersList: [],
	};

	componentDidMount() {
		const { chatRoom } = this.props;
		if (chatRoom) {
			this.addMessageListeners(chatRoom.id);
			this.addTypingListeners(chatRoom.id);
		}
	}

	componentDidUpdate() {
		if (this.messageEndRef) {
			// enter키로 메시지 보낼시동작안함
			// this.messageEndRef.scrollIntoView({ behavior: 'smooth' });
			this.messageEndRef.scrollIntoView();
		}
	}

	componentWillUnmount() {
		this.state.messagesRef.off();
		this.removeListeners(this.state.listenersList);
	}

	removeListeners = (listeners) => {
		listeners.forEach((listener) => {
			listener.ref.child(listener.id).off(listener.event);
		});
	};

	handleSearchMessages = () => {
		const chatRoomMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, 'gi');
		const searchResults = chatRoomMessages.reduce((acc, message) => {
			if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({ searchResults });
	};

	handleSearchChange = (e) => {
		this.setState({ searchTerm: e.target.value, searchLoading: true }, () => this.handleSearchMessages());
	};

	addMessageListeners = (chatRoomId) => {
		let messagesList = [];
		this.state.messagesRef.child(chatRoomId).on('child_added', (DataSnapshot) => {
			messagesList.push(DataSnapshot.val());
			this.setState({ messages: messagesList, messagesLoading: false });
			this.userPostsCount(messagesList);
		});
	};

	addTypingListeners = (chatRoomId) => {
		let typingUsers = [];

		// DB에 Typing 정보가 들어오면 가져온후 렌더링
		this.state.typingRef.child(chatRoomId).on('child_added', (DataSnapshot) => {
			if (DataSnapshot.key !== this.props.user.uid) {
				typingUsers = typingUsers.concat({
					id: DataSnapshot.key,
					name: DataSnapshot.val(),
				});
				this.setState({ typingUsers });
			}
		});

		// listenersList state에 등록된 리스너를 넣어주기
		this.addToListenersList(chatRoomId, this.state.typingRef, 'child_added');

		// DB에 typing 정보가 제거되면
		this.state.typingRef.child(chatRoomId).on('child_removed', (DataSnapshot) => {
			const index = this.state.typingUsers.findIndex((user) => user.id === DataSnapshot.key);
			if (index !== -1) {
				typingUsers = typingUsers.filter((user) => user.id !== DataSnapshot.key);
				this.setState({ typingUsers });
			}
		});

		// listenersList state에 등록된 리스너를 넣어주기
		this.addToListenersList(chatRoomId, this.state.typingRef, 'child_removed');
	};

	addToListenersList = (id, ref, event) => {
		// 이미 등록된 리스너인지 확인
		const index = this.state.listenersList.findIndex((listener) => {
			return listener.id === id && listener.ref === ref && listener.event === event;
		});

		// listenersList 에 '새로' 등록된 리스너 추가
		if (index === -1) {
			const newListener = { id, ref, event };
			this.setState({ listenersList: this.state.listenersList.concat(newListener) });
		}
	};

	userPostsCount = (messages) => {
		let userPosts = messages.reduce((acc, message) => {
			if (message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					image: message.user.image,
					count: 1,
				};
			}
			return acc;
		}, {});
		this.props.dispatch(setUserPosts(userPosts));
	};

	renderMessages = (messages) =>
		messages.length > 0 &&
		messages.map((message) => <Message key={message.timestamp} message={message} user={this.props.user} />);

	renderTypingUsers = (typingUsers) =>
		typingUsers.length > 0 && typingUsers.map((user) => <span>{user.name}님이 채팅을 입력중...</span>);

	renderMessageSkeleton = (loading) =>
		loading && (
			<>
				{[...Array(8)].map((v, i) => (
					<Skeleton key={i} />
				))}
			</>
		);

	render() {
		const { messages, searchTerm, searchResults, typingUsers, messagesLoading } = this.state;

		return (
			<div style={{ padding: '2rem 2rem 0 2rem' }}>
				<MessageHeader handleSearchChange={this.handleSearchChange} />

				<div
					style={{
						width: '100%',
						height: '500px',
						border: '.2rem solid #ececec',
						borderRadius: '4px',
						padding: '1rem',
						marginBottom: '1rem',
						overflowY: 'auto',
					}}
				>
					{this.renderMessageSkeleton(messagesLoading)}
					{searchTerm ? this.renderMessages(searchResults) : this.renderMessages(messages)}
					{this.renderTypingUsers(typingUsers)}

					{/* node는 현재 div를 가리키고 있음 */}
					<div ref={(node) => (this.messageEndRef = node)} />
				</div>

				<MessageForm />
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user.currentUser,
		chatRoom: state.chatRoom.currentChatRoom,
	};
};

export default connect(mapStateToProps)(MainPanel);
