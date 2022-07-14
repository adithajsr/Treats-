<<<<<<< HEAD
/*
This function returns the important information about a user's profile. 

Arguments: 
	authUserId (number): This argument checks whether an authorised use is requesting userProfileV2
	uId (number): This argument is specifying which user's details to return
	
Return Value: 
	Returns {error: 'error'} if the authUserId or uId are invalid
	Returns the uId, email, first name, last name and handle of a user's profile
*/

import {getData} from './dataStore';

export function userProfileV2(authUserId: number, uId: number) {
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


=======
import { getData } from './dataStore'; // will need setData
// import { doesEmailExist, isHandleValid } from './auth';
// eslint-disable-next-line
import validator from 'validator';

/* This function returns the important information about a user's profile.

<authUserId> This function checks whether a valid authUserId is calling the function

<uId> This is the uId that is searched for to return the user's profile

Return Value:
{error: 'error'} if the authUserId or uId are invalid
{info} if the authUserId and uId are valid, returns
important info about a user's profile */

export function userProfileV1(token: string, uId: number) {
  const data = getData();
  // Determining whether token is valid
  let count = 0;
  for (const element of data.token) {
    if (token === element.token) {
      count = 1;
      break;
    }
  }

  // If invalid token
  if (count === 0) {
    return { error: 'error' };
  }

  // Searching for the uId
  for (const element in data.user) {
    if (uId === data.user[element].uId) {
      return {
        uId: data.user[element].uId,
        email: data.user[element].email,
        nameFirst: data.user[element].nameFirst,
        nameLast: data.user[element].nameLast,
        handle: data.user[element].handle
      };
    }
  }
  // If uId doesn't match any uId in data object
  return { error: 'error' };
}
>>>>>>> a06ea1a3b587a7be7bfb3a6f633542ce225e2e48
