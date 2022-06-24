//A file to test the function channelMessages for Iteration 1
//Written by Aditha Jayasuriya, started on 16/06/2022

import {channelMessagesV1} from './channelMessages.js';

//Testing if the given channel is valid 
test('Testing channel validity', () => {
	clear();
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	let returnValue = channelMessagesV1(danielId, danielChannel - 1, 0);
	expect(returnValue).toMatchObject({error: 'error'});
} 

//Testing if the member is a part of the given channel 
test('Testing user access', () => {
	//Input for authUserId must be incongruent with valid channelIds
	//What to do if authUserId is an invalid number? eg. -15
	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	channelInviteV1(danielId, danielChannel, maddyId);

	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');

	let returnValue = channelMessagesV1(samuelId, danielChannel, 0);
	expect(returnValue).toMatchObject({error: 'error'});
	
}

//Testing when start is > no. of messages in given channelId
test('Invalid start argument', () => {
	//Input for start must be > no. of msgs in given channelId
	clear();
	
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);
	
	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

	let returnValue = channelMessagesV1(danielId, danielChannel, 26);
	expect(returnValue).toMatchObject({error: 'error'});

}

//Testing default case
test('Default case', () => {

	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL? DO I JUST USE SETDATA?

	
	
	let returnValue = channelMessagesV1(danielId, danielChannel, 0);
	


}

//Testing when start + 50 is greater than the amount of messages in the channel
test('When end is greater than final message', () => {
	clear();

	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let danielChannel = channelsCreateV1(danielId, 'testName', 1);

	//HOW TO ACTUALLY PASS MESSAGES TO THIS CHANNEL?

	let returnValue = channelMessagesV1(danielId, danielChannel, 35);
	expect(returnValue[3]).toBe(-1);
}