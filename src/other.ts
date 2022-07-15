import { getData, setData } from './dataStore';

/*
This function clears the data

Arguments:
- NONE

Returns:
- NONE
*/
export function clearV1() {
  const data = getData();

  data.user = [];
  data.channel = [];

  data.token = [];
  data.dm = [];

  setData(data);

  return {};
}
