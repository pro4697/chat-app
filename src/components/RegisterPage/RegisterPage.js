import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import md5 from 'md5';
import firebase from '../../firebase';

function RegisterPage() {
	const { register, watch, errors, handleSubmit } = useForm({ mode: 'onChange' });
	const [errorFromSubmit, setErrorFromSubmit] = useState('');
	const [loading, setLoading] = useState(false);

	const password = useRef();
	password.current = watch('password');

	const onSubmit = async (data) => {
		try {
			setLoading(true);
			let createdUser = await firebase
				.auth()
				.createUserWithEmailAndPassword(data.email, data.password);

			await createdUser.user.updateProfile({
				displayName: data.name,
				photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`,
			});

			// DB에 저장
			await firebase.database().ref('users').child(createdUser.user.uid).set({
				name: createdUser.user.displayName,
				image: createdUser.user.photoURL,
				status: 'online',
			});

			setLoading(false);
		} catch (error) {
			setErrorFromSubmit(error.message);
			setTimeout(() => {
				setErrorFromSubmit('');
			}, 5000);
			setLoading(false);
		}
	};

	return (
		<div className='auth-wrapper'>
			<h2>Register</h2>
			<form onSubmit={handleSubmit(onSubmit)}>
				<label>Email</label>
				<input
					name='email'
					type='email'
					ref={register({ required: true, pattern: /^\S+@\S+$/i })}
				/>
				{errors.email && <p>This field is required</p>}

				<label>Name</label>
				<input name='name' ref={register({ required: true, maxLength: 10 })} />
				{errors.name && errors.name.type === 'required' && <p>This name field is required</p>}
				{errors.name && errors.name.type === 'maxLength' && <p>Your input exceed maximum length</p>}

				<label>Password</label>
				<input name='password' type='password' ref={register({ required: true, minLength: 6 })} />
				{errors.password && errors.password.type === 'required' && (
					<p>This name field is required</p>
				)}
				{errors.password && errors.password.type === 'minLength' && (
					<p>Password must have at least 6 characters</p>
				)}

				<label>Password Comfirm</label>
				<input
					name='password_confirm'
					type='password'
					ref={register({ required: true, validate: (value) => value === password.current })}
				/>
				{errors.password_confirm && errors.password_confirm.type === 'required' && (
					<p>This password confirm field is required</p>
				)}
				{errors.password_confirm && errors.password_confirm.type === 'validate' && (
					<p>This password do not match</p>
				)}

				{errorFromSubmit && <p>{errorFromSubmit}</p>}

				<input type='submit' disabled={loading} />
				<Link style={{ color: 'grey', textDecoration: 'none', fontSize: '14px' }} to='login'>
					이미 아이디가 있다면...
				</Link>
			</form>
		</div>
	);
}

export default RegisterPage;
