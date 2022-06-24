import { getData, setData } from './dataStore.js';

function clearV1() {
  let data = getData();

  data.user = [];
  data.channel = [];

  setData(data);

  return {};
}

export { clearV1 };
