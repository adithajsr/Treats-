import {getData} from './dataStore'
import {setData} from './dataStore'

<<<<<<< HEAD
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
=======
// Assume that the clear function should keep the users and channels arrays and not
// remove them.
export function clearV1() {
  const data = getData();

  data.user = [];
  data.channel = [];
>>>>>>> fddfb39e7b423495986f1a084c34ccfc0679cf5c

	setData(data);

	return {};
}
