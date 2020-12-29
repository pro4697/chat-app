import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import firebase from '../../firebase';

function LoginPage() {
	const { register, errors, handleSubmit } = useForm({ mode: 'onChange' });
	const [errorFromSubmit, setErrorFromSubmit] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (data) => {
		try {
			setLoading(true);

			await firebase.auth().signInWithEmailAndPassword(data.email, data.password);
			setLoading(false);
		} catch (error) {
			setLoading(false);
		}
	};

	return (
		<div className='auth-wrapper'>
			<h2>Login</h2>
			<form onSubmit={handleSubmit(onSubmit)}>
				<label>Email</label>
				<input name='email' type='email' ref={register({ required: true, pattern: /^\S+@\S+$/i })} />
				{errors.email && <p>This field is required</p>}

				<label>Password</label>
				<input name='password' type='password' ref={register({ required: true, minLength: 6 })} />
				{errors.password && errors.password.type === 'required' && <p>This name field is required</p>}
				{errors.password && errors.password.type === 'minLength' && <p>Password must have at least 6 characters</p>}

				{errorFromSubmit && <p>{errorFromSubmit}</p>}

				<input type='submit' disabled={loading} />
				<Link style={{ color: 'grey', textDecoration: 'none', fontSize: '14px' }} to='register'>
					계정 생성...
				</Link>
			</form>
		</div>
	);
}

export default LoginPage;
