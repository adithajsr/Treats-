import { getData, setData } from './dataStore';

// Assume that the clear function should keep the
// users and channels arrays and not remove them.
export function clearV1() {
  const data = getData();
  data.user = [];
  data.channel = [];

  setData(data);

  return {};
}
