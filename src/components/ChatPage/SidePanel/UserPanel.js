import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Image } from 'react-bootstrap';
import { IoIosChatboxes } from 'react-icons/io';
import firebase from '../../../firebase';
import mime from 'mime-types';
import { clearChatRoom } from '../../../redux/actions/chatRoom_action';
import { setPhotoURL } from '../../../redux/actions/user_action';

function UserPanel() {
	const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
	const user = useSelector((state) => state.user.currentUser);
	const typingRef = firebase.database().ref('typing');
	const dispatch = useDispatch();

	const inputOpenImageRef = useRef();

	const handleOpenImageRef = () => {
		inputOpenImageRef.current.click();
	};

	const handleLogout = () => {
		typingRef.child(chatRoom.id).child(user.uid).remove();
		firebase.database().ref('users').child(user.uid).update({ status: 'offline' });
		dispatch(clearChatRoom());
		firebase.auth().signOut();
	};

	const handleUploadImage = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const metadata = { contentType: mime.lookup(file.name) };

		try {
			// 스토리지에 파일 저장
			let uploadTaskSnapshot = await firebase
				.storage()
				.ref()
				.child(`user_image/${user.uid}`)
				.put(file, metadata);

			let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

			// 프로필 이미지 수정
			firebase.auth().currentUser.updateProfile({ photoURL: downloadURL });

			dispatch(setPhotoURL(downloadURL));

			// 데이터베이스 유저 이미지 수정
			await firebase.database().ref('users').child(user.uid).update({ image: downloadURL });
		} catch (error) {
			alert(error);
		}
	};

	return (
		<div>
			<h3 style={{ color: 'white' }}>
				<IoIosChatboxes style={{ marginBottom: '5px' }} /> Chat App
			</h3>

			<div style={{ display: 'flex', marginBottom: '1rem' }}>
				<Image
					src={user && user.photoURL}
					style={{ width: '30px', height: '30px', marginTop: '3px' }}
					roundedCircle
				/>
				<Dropdown>
					<Dropdown.Toggle style={{ background: 'transparent', border: '0' }} id='dropdown-basic'>
						{user && user.displayName}
					</Dropdown.Toggle>

					<Dropdown.Menu>
						<Dropdown.Item onClick={handleOpenImageRef}>프로필 사진 변경</Dropdown.Item>
						<Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>

			<input
				onChange={handleUploadImage}
				accept='image/jpeg, image/jpg, image/png'
				style={{ display: 'none' }}
				ref={inputOpenImageRef}
				type='file'
			/>
		</div>
	);
}

export default UserPanel;
