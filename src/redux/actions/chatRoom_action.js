import {
	SET_CURRENT_CHAT_ROOM,
	SET_CHAT_ROOM_TYPE,
	SET_USER_POSTS,
	CLEAR_CHAT_ROOM,
} from './types';

export function setCurrentChatRoom(currentChatRoom) {
	return {
		type: SET_CURRENT_CHAT_ROOM,
		payload: currentChatRoom,
	};
}

export function setChatRoomType(chatRoomType) {
	return {
		type: SET_CHAT_ROOM_TYPE,
		payload: chatRoomType,
	};
}

export function setUserPosts(userPosts) {
	return {
		type: SET_USER_POSTS,
		payload: userPosts,
	};
}

export function clearChatRoom() {
	return {
		type: CLEAR_CHAT_ROOM,
	};
}
