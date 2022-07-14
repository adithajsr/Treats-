import {getData} from './dataStore.js'
import {setData} from './dataStore.js'

/*
This function clears the data 

Arguments: 
	NONE

Returns: 
	NONE
*/
export function clearV2() {
	let data = getData();
	
	data.user = [];
	data.channel = [];

	setData(data);

	return {};
}
