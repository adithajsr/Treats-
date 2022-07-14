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
	const data = getData();

	data.user = [];
	data.channel = [];
	setData(data);

	return {};
}
