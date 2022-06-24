
//A file to test the function clear for Iteration 1
//Written by Aditha Jayasuriya, started on 17/06/2022

import {clearV1} from './clear.js'
import {authRegisterV1} from './js'


test('Testing clearing users', () => {

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor');

	clear();

	expect(data.user.length).toBe(0);
	expect(data.channels.length).toBe(0);
})


test('Testing clearing four channels with one user in each of them', () => {

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	channelsCreateV1(danielId, 'testName', 1);

	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');
	channelsCreateV1(samuelId, 'testName2', 0);

	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	channelsCreateV1(maddyId, 'testName2', 0);

	let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor');
	channelsCreateV1(maiyaId, 'testName3', 0);

	clear();

	expect(data.user.length).toBe(0);
	expect(data.channels.length).toBe(0);


})

test('Testing clearing two channels with multiple users in each of them', () => {

	//Creating danielChannel and inviting Maiya and Maddy to it
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);
	
	let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor');
	channelInviteV1(danielId, danielChannel, maiyaId);
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	channelInviteV1(danielId, danielChannel, maddyId);

	//Creating samuelChannel and inviting Maiya and Maddy to it
	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');
	let samuelChannel = channelsCreateV1(samuelId, 'testNam12', 0);

	channelInviteV1(samuelId, samuelChannel, maiyaId);

	channelInviteV1(samuelId, samuelChannel, maddyId);

	//Testing clear function
	clear();
	
	expect(data.user.length).toBe(0);
	expect(data.channels.length).toBe(0);

})

