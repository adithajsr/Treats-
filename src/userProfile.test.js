//A file to test the function userProfile for Iteration 1
//Written by Aditha Jayasuriya, started on 17/06/2022


//Testing when given uId is invalid 
test('Testing invalid uId', () => {
	clear();
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	
	let returnValue = userProfileV1(maddyId/2, maddyId/2);
	expect(returnValue).toBe({error: 'error'});
})

//Testing default case 
test('Default case', () => {
	//What is difference between authId and uId?? 
	clear();

	let maiyaId = authRegisterV1('maiyaTaylor@gmail.com', 'password3', 'Maiya', 'Taylor');
	let samuelId = authRegisterV1('samSchreyer@gmail.com', 'password1', 'Samuel', 'Schreyer');
	let danielId = authRegisterV1('danielYung@gmail.com', 'password', 'Daniel', 'Yung');
	let maddyId = authRegisterV1('maddyHaines@gmail.com', 'password2', 'Maddy', 'Haines');
	
	maiyaInfo = {
		uId: maiyaId, 
		email: 'maiyaTaylor@gmail.com', 
		password: 'password3', 
		nameFirst: 'Maiya', 
		nameLast: 'Taylor', 
		handle: 'maiyataylor', 
		globalPerms: 'global'
	}

	expect(userProfileV1(maiyaId, maiyaId)).toMatchObject(maiyaInfo);
})