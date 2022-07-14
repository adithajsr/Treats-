import {getData} from './dataStore'
import {setData} from './dataStore'

/*
This function clears the data 

Arguments: 
	NONE

Returns: 
	NONE
*/
export function clearV1() {
	let data = getData();
	
	data.user = [];
	data.channel = [];

	setData(data);

	return {};
}
