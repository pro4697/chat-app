import React from 'react';
import { useSelector } from 'react-redux';
import SidePanel from './SidePanel/SidePanel';
import MainPanel from './MainPanel/MainPanel';

function ChatPage() {
	const currentUser = useSelector((state) => state.user.currentUser);
	const currentChatRoom = useSelector((state) => state.chatRoom.currentChatRoom);

	return (
		<div style={{ display: 'flex' }}>
			<div style={{ width: '300px' }}>
				<SidePanel key={currentUser && currentUser.uid} />
			</div>
			<div style={{ minWidth: '500px', margin: 'auto' }}>
				<MainPanel key={currentChatRoom && currentChatRoom.id} />
			</div>
		</div>
	);
}

export default ChatPage;
