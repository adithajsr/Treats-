import {getData} from './dataStore.js'
import {setData} from './dataStore.js'

//Assume that the clear function should keep the users and channels arrays and not 
//remove them.
function clearV1() {
	let data = getData();
	
	data.users = [];
	data.channels = [];

	setData(data);

	return {};
}