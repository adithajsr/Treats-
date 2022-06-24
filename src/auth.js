import { getData, setData } from './dataStore';

const { v4: uuidv4 } = require('uuid');
var validator = require('validator');

let dataSet = getData();

export function isHandleValid(handle) {
	const regex = /^[a-z]{0,20}$[0-9]*/;
	return regex.test(handle);
}

export function isUuidValid(Id) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(Id);
}

export function isUuidInUse(Id) {
	for (const item of dataSet.user) {
		if (item.uId === Id) {
			return true;
		}
	}
	return false;
}

export function doesEmailExist(email) {
    for(const item of dataSet.user) {
      if (item.email === email) {
        return true;
      }
    }
    return false;
  }

export function authLoginV1 (email, password) {
	for (const item of dataSet.user) {
		if (item.email === email) {
			if (item.password === password) {
				// If both arguments match an account
				return item.uId;
			} else {
				// If password doesn't match the email's
				return { error: 'error'};
			}
		}
	}
	// If no email matches the 1st argument
	return { error: 'error'};
}

export function authRegisterV1 (email, password, nameFirst, nameLast) {
	// TEST DETAILS
	if (password.length < 6) {
		return { error: 'error'};
	}
	if (!validator.isEmail(email)) {
		return { error: 'error'};
	}
	if (doesEmailExist(email)) {
		return { error: 'error'};
	}
	if (nameFirst.length < 1 || nameFirst.length > 50) {
		return { error: 'error'};
	}
	if (nameLast.length < 1 || nameLast.length > 50) {
		return { error: 'error'};
	}

	// CREATE UUID
	let newUserId = uuidv4();
	while (!isUuidValid(newUserId) || isUuidInUse(newUserId)) {
		newUserId = uuidv4();
	}

	// MAKE HANDLE
	let fullName = nameFirst + nameLast;
	let newHandle = fullName.toLowerCase();
	if (newHandle.length > 20) {
		newHandle = newHandle.slice(0,20);
	}
	// test if handle is already in use, find highest number at the end
	let highestIndex = 0;
	let isDupplicate = false;
	for (const item of dataSet.user) {
		if (item[handle].search(newHandle) === 0) {
			if (item[handle].search(/[0-9]{1,}$/) === -1) {
				newHandle = newHandle + '1';
			} else {
				isDupplicate = true;
				let strDigit = newHandle.replace(/^[a-z]{0,20}/,/^$/);
				if (parseInt(strDigit) > highestIndex) {
					highestIndex = parseInt(strDigit)
				}
			}
		}
	}
	
	if (isDupplicate) {
		highestIndex++;
		newHandle = newHandle + `${highestIndex}`;
	}

	// PEFORM RETURN & UPDATE "dataStore"
	let globalPermissions = undefined;
	if (setData.user === undefined) {
		globalPermissions = 'owner';
	} else {
		globalPermissions = 'member';
	}

	dataSet.user.push({
		uId: newUserId,
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handle: newHandle,
        globalPerms: globalPermissions,
	});
	setData(dataSet);
	return newUserId;
}