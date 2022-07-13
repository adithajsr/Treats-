
import {getData} from './dataStore'
import {setData} from './dataStore'

//Assume that the clear function should keep the users and channels arrays and not 
//remove them.
export function clearV1() {
	let data = getData();
	
	console.log('clear');

	data.user = [];
	data.channel = [];
	data.token = [];
	data.dm = [];

	setData(data);

	return {};
}

