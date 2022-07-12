
import request from 'sync-request';

let authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
let authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];


function requestHelper(method:HttpVerb, path: String, payload: object) {
	let qs = {};
	let json = {};

	if (['GET' || 'DELETE'].includes(method) == true) {
		qs = payload;
	}

	else {
		json = payload; 
	}

	const res = request(method, SERVER_URL + path, { qs, json}); //request takes in three arguments
	return JSON.parse(res.getBody('utf-8')); // what does utf-8 do?
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
	return requestHelper('GET', '/auth/register/v2', {email, password, nameFirst, nameLast});
}

function requestClear() {
	return requestHelper('DELETE', '/clear/v1', {});
}

function requestUserProfile(authUserId: number, uId: number) {
	return requestHelper('GET', '/user/profile/v2', {authUserId, uId});
}

function requestChannelsCreate(authuserId: number, channelName: string, globalPerms: number) {
	return requestHelper('GET', '/channels/create/v2', {authUserId, channelName, globalPerms});
}

function requestChannelsListAll() {
	return requestHelper('GET', '/channels/listall/v2', {})
}

function requestChannelInvite(InviterAUI: number, channelId: number, InviteeAUI: number) {
	return requestHelper('POST', '/channel/invite/v2', {InviterAUI, channelId, InviteeAUI});
}


test('Clearing users', () => {
	let danielId = requestAuthRegister(authDaniel[0], authDaniel[1],authDaniel[2], authDaniel[3]);
	requestClear();
	expect(requestUserProfile(danielId, danielId).toMatchObject({error: 'error'}));
});

test('Clearing channels containing users', () => {
	let danielId = requestAuthRegister(authDaniel[0], authDaniel[1],authDaniel[2], authDaniel[3]);
	requestClear();

	requestChannelsCreate(danielId, 'danielChannel', 1);

	requestClear();

	expect(requestUserProfile(danielId, danielId).toMatchObject({error: 'error'}));

	expect(requestChannelsListAll()).toMatchObject([]);

});

test('Clearing channels containing multiple users', () => {
	let danielId = requestAuthRegister(authDaniel[0], authDaniel[1],authDaniel[2], authDaniel[3]);
	let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1],authMaiya[2], authMaiya[3]);
	let danielChannel = requestChannelsCreate(danielId, 'danielChannel', 1);
	let maiyaChannel = requestChannelsCreate(maiyaId, 'maiyaChannel', 1);
	
	requestChannelInvite(danielId, danielChannel, maiyaId);
	requestChannelInvite(maiyaId, maiyaChannel, danielId);
	
	requestClear();


	expect(requestUserProfile(danielId, danielId).toMatchObject({error: 'error'}));
	expect(requestUserProfile(maiyaId, maiyaId).toMatchObject({error: 'error'}));
	expect(requestChannelsListAll()).toMatchObject([]);

});

