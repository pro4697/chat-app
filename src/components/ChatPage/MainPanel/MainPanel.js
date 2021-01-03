import React, { Component } from 'react';
import { connect } from 'react-redux';
import MessageHeader from './MessageHeader';
import Message from './Message';
import MessageForm from './MessageForm';
import firebase from '../../../firebase';

export class MainPanel extends Component {
	state = {
		messages: [],
		messagesRef: firebase.database().ref('messages'),
		messagesLoading: true,
		searchTerm: '',
		searchResults: [],
		searchLoading: false,
	};

	componentDidMount() {
		const { chatRoom } = this.props;
		if (chatRoom) {
			this.addMessageListeners(chatRoom.id);
		}
	}

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
		});
	};

	renderMessages = (messages) =>
		messages.length > 0 &&
		messages.map((message) => <Message key={message.timestamp} message={message} user={this.props.user | null} />);

	render() {
		const { messages, searchTerm, searchResults } = this.state;

		return (
			<div style={{ padding: '2rem 2rem 0 2rem' }}>
				<MessageHeader handleSearchChange={this.handleSearchChange} />

				<div
					style={{
						width: '100%',
						height: '450px',
						border: '.2rem solid #ececec',
						borderRadius: '4px',
						padding: '1rem',
						marginBottom: '1rem',
						overflowY: 'auto',
					}}
				>
					{searchTerm ? this.renderMessages(searchResults) : this.renderMessages(messages)}
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
