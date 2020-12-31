import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { IoIosChatboxes } from 'react-icons/io';

function UserPanel() {
	return (
		<div>
			{/* Logo */}
			<h3 style={{ color: 'white' }}>
				<IoIosChatboxes /> Chat App
			</h3>

			<div style={{ display: 'flex', marginBottom: '1rem' }}>
				<Dropdown>
					<Dropdown.Toggle variant='success' id='dropdown-basic'>
						Dropdown Button
					</Dropdown.Toggle>

					<Dropdown.Item></Dropdown.Item>
				</Dropdown>
			</div>
		</div>
	);
}

export default UserPanel;
