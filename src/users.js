

//This function returns the important information about a user's profile. 
/*
	<authUserId> This function checks whether a valid authUserId is calling the function

	<uId> This is the uId that is searched for to return the user's profile

	Return Value: 
		{error: 'error'} if the authUserId or uId are invalid
		{info} if the authUserId and uId are valid, returns important info about a 
		user's profile

*/

import {getData} from './dataStore.js';

export function userProfileV2(authUserId, uId) {
	let data = getData();

	//Determining whether authUserId is valid 
	let count = 0;
	for (const element in data.user) {
		if (authUserId === data.user[element].uId) {
			count = 1;
			break;
		}
	}

	//If invalid authUserId
	if (count === 0) {
		return {error: 'error'};
	}


	//Searching for the uId
	for (const element in data.user) {
		if (uId === data.user[element].uId) {
			return {
				uId: data.user[element].uId, 
				email: data.user[element].email, 
				nameFirst: data.user[element].nameFirst, 
				nameLast: data.user[element].nameLast,
				handle: data.user[element].handle
		}
	}
	//If uId doesn't match any uId in data object
	return {error: 'error'};
	}
}


