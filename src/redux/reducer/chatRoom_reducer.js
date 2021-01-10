import {
	SET_CURRENT_CHAT_ROOM,
	SET_CHAT_ROOM_TYPE,
	SET_USER_POSTS,
	CLEAR_CHAT_ROOM,
} from '../actions/types';

const initialChatRoomState = {
	currentChatRoom: null,
	chatRoomType: 'public',
};

export default function (state = initialChatRoomState, action) {
	switch (action.type) {
		case SET_CURRENT_CHAT_ROOM:
			return {
				...state,
				currentChatRoom: action.payload,
			};
		case SET_CHAT_ROOM_TYPE:
			return {
				...state,
				chatRoomType: action.payload,
			};
		case SET_USER_POSTS:
			return {
				...state,
				userPosts: action.payload,
			};
		case CLEAR_CHAT_ROOM:
			return {
				...state,
				currentChatRoom: null,
			};
		default:
			return state;
	}
}
