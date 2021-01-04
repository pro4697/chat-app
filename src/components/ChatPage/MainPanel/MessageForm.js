import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Form, ProgressBar, Row, Col } from 'react-bootstrap';
import mine from 'mime-types';
import firebase from '../../../firebase';

function MessageForm() {
	const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
	const user = useSelector((state) => state.user.currentUser);
	const isPrivateChatRoom = useSelector((state) => state.chatRoom.isPrivateChatRoom);
	const inputOpenImageRef = useRef();
	const [content, setContent] = useState('');
	const [errors, setErrors] = useState([]);
	const [loading, setLoading] = useState(false);
	const [percentage, setPercentage] = useState(0);
	const messagesRef = firebase.database().ref('messages');
	const storageRef = firebase.storage().ref();
	const typingRef = firebase.database().ref('typing');

	const handleChange = (e) => {
		setContent(e.target.value);
	};

	const createMessage = (fileUrl = null) => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: user.uid,
				name: user.displayName,
				image: user.photoURL,
			},
		};
		if (fileUrl !== null) {
			message['image'] = fileUrl;
		} else {
			message['content'] = content;
		}
		return message;
	};

	const handleSubmit = async () => {
		if (!content) {
			setErrors((prev) => prev.concat('Type contents first'));
			setTimeout(() => {
				setErrors([]);
			}, 5000);
			return;
		}
		setLoading(true);

		// firebase에 메시지 저장
		try {
			await messagesRef.child(chatRoom.id).push().set(createMessage());
			typingRef.child(chatRoom.id).child(user.uid).remove();
			setLoading(false);
			setContent('');
			setErrors([]);
		} catch (error) {
			setErrors((prev) => prev.concat(error.message));
			setLoading(false);
			setTimeout(() => {
				setErrors([]);
			}, 5000);
		}
	};

	const handleOpenImageRef = () => {
		inputOpenImageRef.current.click();
	};

	const getPath = () => {
		if (isPrivateChatRoom) {
			return `message/private/${chatRoom.id}`;
		} else {
			return `message/public/`;
		}
	};

	const handleUploadImage = (e) => {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		setLoading(true);
		const filePath = `${getPath()}/${file.name}`;
		const metadata = { contentType: mine.lookup(file.name) };

		try {
			// 스토리지에 파일저장
			let uploadTask = storageRef.child(filePath).put(file, metadata);

			// 저장 진행 퍼센테이지 구하기
			uploadTask.on(
				'state_change',
				(UploadTaskSnapshot) => {
					const percentage = Math.round((UploadTaskSnapshot.bytesTransferred / UploadTaskSnapshot.totalBytes) * 100);
					setPercentage(percentage);
				},
				(error) => {
					setLoading(false);
					console.log(error);
				},
				() => {
					// 저장 완료후 파일 메시지 전송 (DB에 저장)
					// 저장된 파일을 다운로드 받을 수 있는 URL 가져오기

					uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
						messagesRef.child(chatRoom.id).push().set(createMessage(downloadURL));
						setLoading(false);
					});
				}
			);
		} catch (error) {
			alert(error);
		}
	};

	const handleKeyDown = () => {
		if (content) {
			typingRef.child(chatRoom.id).child(user.uid).set(user.displayName);
		} else {
			typingRef.child(chatRoom.id).child(user.uid).remove();
		}
	};

	return (
		<div>
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId='exampleForm.ControlTextarea1'>
					<Form.Control onKeyDown={handleKeyDown} value={content} onChange={handleChange} as='textarea' rows={3} />
				</Form.Group>
			</Form>

			{!(percentage === 0 || percentage === 100) && (
				<ProgressBar variant='warning' label={`${percentage}%`} now={percentage} />
			)}

			<div>
				{errors.map((errorMsg) => (
					<p style={{ color: 'red' }} key={errorMsg}>
						{errorMsg}
					</p>
				))}
			</div>

			<Row>
				<Col>
					<button onClick={handleSubmit} className='message-form-button' style={{ width: '100%' }} disabled={loading}>
						SEND
					</button>
				</Col>
				<Col>
					<button
						onClick={handleOpenImageRef}
						className='message-form-button'
						style={{ width: '100%' }}
						disabled={loading}
					>
						UPLOAD
					</button>
				</Col>
			</Row>

			<input
				accept='image/jpeg, image/jpg, image/png'
				style={{ display: 'none' }}
				type='file'
				ref={inputOpenImageRef}
				onChange={handleUploadImage}
			/>
		</div>
	);
}

export default MessageForm;
