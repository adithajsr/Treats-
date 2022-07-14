<<<<<<< HEAD

//A file to test the function userProfile for Iteration 1
//Written by Aditha Jayasuriya, started on 17/06/2022

//This function returns the important information about a user's profile. 
/*
	<authUserId> This function checks whether a valid authUserId is calling the function

	<uId> This is the uId that is searched for to return the user's profile

	Return Value: 
		{error: 'error'} if the authUserId or uId are invalid
		{info} if the authUserId and uId are valid, returns important info about a 
		user's profile

*/

import {clearV1} from './other.js'
import {authRegisterV1} from './auth.js'
import {userProfileV1} from './users.js'

test('Testing invalid uId', () => {
	clearV1();
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	
	let returnValue = userProfileV1(maddyId/2, maddyId/2);
	expect(returnValue).toMatchObject({error: 'error'});
})

//Testing default case 
test('Default case', () => {
	
	clearV1();

	let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor').authUserId;
	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer').authUserId;
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung').authUserId;
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines').authUserId;
	
	const maiyaInfo = {
		uId: maiyaId, 
		email: 'maiyaTaylor@gmail.com', 
		nameFirst: 'Maiya', 
		nameLast: 'Taylor', 
		handle: 'maiyataylor'
	}


	expect(userProfileV1(maiyaId, maiyaId)).toMatchObject(maiyaInfo);
})
=======
// // A file to test the function userProfile for Iteration 1
// // Written by Aditha Jayasuriya, started on 17/06/2022

// // This function returns the important information about a user's profile.
// /*
// 	<authUserId> This function checks whether a valid authUserId is calling the function

// 	<uId> This is the uId that is searched for to return the user's profile

// 	Return Value:
// 		{error: 'error'} if the authUserId or uId are invalid
// 		{info} if the authUserId and uId are valid, returns important info about a
// 		user's profile

// */

// import { clearV1 } from './other.js';
// import { authRegisterV1 } from './auth.js';
// import { userProfileV1 } from './users.js';

// test('Testing invalid uId', () => {
//   clearV1();
//   const maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');

//   const returnValue = userProfileV1(maddyId / 2, maddyId / 2);
//   expect(returnValue).toMatchObject({ error: 'error' });
// });

// // Testing default case
// test('Default case', () => {
//   clearV1();

//   const maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor').authUserId;
//   const samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer').authUserId;
//   const danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung').authUserId;
//   const maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines').authUserId;

//   const maiyaInfo = {
//     uId: maiyaId,
//     email: 'maiyaTaylor@gmail.com',
//     nameFirst: 'Maiya',
//     nameLast: 'Taylor',
//     handle: 'maiyataylor'
//   };

//   expect(userProfileV1(maiyaId, maiyaId)).toMatchObject(maiyaInfo);
// });

>>>>>>> f5a8600e87528dbb92ecb8a0ef9ad5fbbaa69341
