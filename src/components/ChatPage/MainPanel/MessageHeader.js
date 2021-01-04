import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, InputGroup, FormControl, Image, Accordion, Card, Button, Media } from 'react-bootstrap';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import firebase from '../../../firebase';

function MessageHeader({ handleSearchChange }) {
	const user = useSelector((state) => state.user.currentUser);
	const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
	const chatRoomType = useSelector((state) => state.chatRoom.chatRoomType);
	const userPosts = useSelector((state) => state.chatRoom.userPosts);
	const isPrivateChatRoom = useSelector((state) => state.chatRoom.isPrivateChatRoom);
	const [isFavorited, setIsFavorited] = useState(false);
	const usersRef = firebase.database().ref('users');

	useEffect(() => {
		if (chatRoom && user) {
			addFavoriteListener(chatRoom.id, user.uid);
		}
	}, [chatRoom, user]);

	const addFavoriteListener = (chatRoomId, userId) => {
		usersRef
			.child(userId)
			.child('favorited')
			.once('value')
			.then((data) => {
				if (data.val() !== null) {
					const chatRoomIds = Object.keys(data.val());
					const isAlreadyFavorited = chatRoomIds.includes(chatRoomId);
					setIsFavorited(isAlreadyFavorited);
				}
			});
	};

	const handleFavorite = () => {
		if (isFavorited) {
			usersRef
				.child(`${user.uid}/favorited`)
				.child(chatRoom.id)
				.remove((err) => {
					if (err != null) {
						console.log(err);
					}
				});
			setIsFavorited((prev) => !prev);
		} else {
			usersRef.child(`${user.uid}/favorited`).update({
				[chatRoom.id]: {
					name: chatRoom.name,
					description: chatRoom.description,
					createdBy: {
						name: chatRoom.createdBy.name,
						image: chatRoom.createdBy.image,
					},
				},
			});
			setIsFavorited((prev) => !prev);
		}
	};

	const renderUserPosts = (userPosts) => {
		return Object.entries(userPosts)
			.sort((a, b) => b[1].count - a[1].count)
			.map(([key, val], i, arr) => (
				<Media key={i}>
					<Image
						src={val.image}
						alt={val.name}
						className='mr-3'
						style={{ borderRadius: '25px', width: '48px', height: '48px' }}
					/>
					<Media.Body>
						<h6>{key}</h6>
						<p>{`${val.count} 개`}</p>
						{i != arr.length - 1 && <hr />}
					</Media.Body>
				</Media>
			));
	};
	return (
		<div
			style={{
				width: '100%',
				height: '170px',
				border: '.2rem solid #ececec',
				borderRadius: '4px',
				padding: '1rem',
				marginBottom: '1rem',
			}}
		>
			<Container>
				<Row>
					<Col>
						<h2>
							{isPrivateChatRoom ? (
								<FaLock style={{ marginBottom: '10px' }} />
							) : (
								<FaLockOpen style={{ marginBottom: '10px' }} />
							)}
							{chatRoom && ` ${chatRoom.name} `}
							{!isPrivateChatRoom && (
								<span style={{ cursor: 'pointer' }} onClick={handleFavorite}>
									{isFavorited ? (
										<MdFavorite style={{ borderBottom: '10px' }} />
									) : (
										<MdFavoriteBorder style={{ borderBottom: '10px' }} />
									)}
								</span>
							)}
						</h2>
					</Col>
					<Col>
						<InputGroup className='mb-3'>
							<InputGroup.Prepend>
								<InputGroup.Text id='basic-addon1'>
									<AiOutlineSearch />
								</InputGroup.Text>
							</InputGroup.Prepend>
							<FormControl
								onChange={handleSearchChange}
								placeholder='검색...'
								aria-label='Search'
								aria-describedby='basic-addon1'
							/>
						</InputGroup>
					</Col>
				</Row>
				{chatRoomType !== 'private' && (
					<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<p>
							<Image
								src={chatRoom && chatRoom.createdBy.image}
								roundedCircle
								style={{ width: '30px', height: '30px', margin: '0 5px' }}
							/>{' '}
							{chatRoom && chatRoom.createdBy.name}
						</p>
					</div>
				)}
				<Row>
					<Col>
						<Accordion>
							<Card>
								<Card.Header style={{ padding: '0rem 1rem' }}>
									<Accordion.Toggle as={Button} variant='link' eventKey='0'>
										Description
									</Accordion.Toggle>
								</Card.Header>
								<Accordion.Collapse eventKey='0'>
									<Card.Body>{chatRoom && chatRoom.description}</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Col>
					<Col>
						<Accordion>
							<Card>
								<Card.Header style={{ padding: '0 1rem' }}>
									<Accordion.Toggle as={Button} variant='link' eventKey='0'>
										Posts Count
									</Accordion.Toggle>
								</Card.Header>
								<Accordion.Collapse eventKey='0'>
									<Card.Body>{userPosts && renderUserPosts(userPosts)}</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default MessageHeader;
