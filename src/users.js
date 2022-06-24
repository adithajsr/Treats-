import {getData} from './dataStore.js'
function userProfileV1(authUserId, uId) {
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
	if (count === 0) return {error: 'error'}


	//Searching for the uId
	for (const element in data.user) {
		if (uId === data.user[element].uId) {
			return user;
		}
	}
	//If uId doesn't match any uId in data object
	return {error: 'error'};
}
export { userProfileV1 }