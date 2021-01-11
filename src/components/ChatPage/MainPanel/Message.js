import React, { useState } from 'react';
import { Media } from 'react-bootstrap';
import moment from 'moment';

function Message({ message, user }) {
	const [imageLoad, setImageLoad] = useState(false);
	const isMine = user && message.user.id === user.uid ? '-mine' : '';
	const timeFromNow = (timestamp) => moment(timestamp).fromNow();

	const isImage = (message) => {
		return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
	};

	return (
		<Media className={`message${isMine}`}>
			<img
				className={`message${isMine}-profile-img`}
				src={message.user.image}
				alt={message.user.name}
			/>
			<Media.Body>
				<h6 className={`message${isMine}-info`}>
					{`${message.user.name} `}
					<span className={`message${isMine}-timestamp`}>{timeFromNow(message.timestamp)}</span>
				</h6>
				{isImage(message) ? (
					<img
						className={imageLoad ? `message${isMine}-img` : `message${isMine}-img-skeleton`}
						alt='이미지'
						src={message.image}
						onClick={(e) => window.open(e.target.src, '_blank')}
						onLoad={() => setImageLoad(true)}
					/>
				) : (
					<pre className={`message${isMine}-content`}>{message.content}</pre>
				)}
			</Media.Body>
		</Media>
	);
}

export default Message;
