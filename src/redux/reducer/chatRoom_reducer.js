import { SET_CURRENT_CHAT_ROOM } from '../actions/types';

const initialChatRoomState = {
	CurrentChatRoom: null,
};

export default function (state = initialChatRoomState, action) {
	switch (action.type) {
		case SET_CURRENT_CHAT_ROOM:
			return {
				...state,
				CurrentChatRoom: action.payload,
			};
		default:
			return state;
	}
}
