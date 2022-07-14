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
	return requestHelper('POST', '/auth/register/v2', {email, password, nameFirst, nameLast});
}

function requestClear() {
	return requestHelper('DELETE', '/clear/v2', {});
}

function requestUserProfile(authUserId: number, uId: number) {
	return requestHelper('GET', '/user/profile/v2', {authUserId, uId});
}


test('Invalid uId', () => {
	requestClear();
	let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId;
	let returnObject = requestUserProfile(maiyaId/2, maiyaId/2);

	expect(returnObject).toMatchObject({error: 'error'});
});

test('Testing invalid uId', () => {
	requestClear();

	let maiyaId = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]).authUserId;
	let danielId = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]).authUserId;

	
	const maiyaInfo = {
		uId: maiyaId, 
		email: 'maiyaTaylor@gmail.com', 
		nameFirst: 'Maiya', 
		nameLast: 'Taylor', 
		handle: 'maiyataylor',
		globalPerms: 'global'
	}

	const danielInfo = {
		uId: danielId, 
		email: 'danielYung@gmail.com', 
		nameFirst: 'Daniel', 
		nameLast: 'Yung', 
		handle: 'danielyung',
		globalPerms: 'global'
	}
	expect(requestUserProfile(maiyaId, maiyaId).toMatchObject(maiyaInfo));
	expect(requestUserProfile(danielId, danielId).toMatchObject(danielInfo));
});





