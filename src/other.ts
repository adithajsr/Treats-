import { getData, setData, emptyData } from './dataStore';

/*
This function clears the data

Arguments:
- NONE

Returns:
- NONE
*/
export function clearV1() {
  let data = getData();
  data = emptyData;
  setData(data);

  return {};
}
