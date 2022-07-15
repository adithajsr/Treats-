import fs from 'fs';

interface user {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  handle: string,
  globalPerms: number,
}

interface channelMember {
  uId: number,
  channelPerms: number,
}

interface dmMember {
  uId: number,
  dmPerms: number,
}

interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

interface channel {
  channelId: number,
  channelName: string,
  isPublic: boolean,
  members: channelMember[],
  messages: message[],
}

interface token {
  token: string,
  uId: number,
}

interface dm {
  dmId: number,
  name: string,
  members: dmMember[],
  messages: message[],
}

interface database {
  user: user[],
  channel: channel[],
  token: token[],
  dm: dm[],
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
const emptyData: database = {
  user: [],
  channel: [],
  token: [],
  dm: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// TODO: remove original code
// // Use get() to access the data
// function getData() {
//   return data;
// }

// // Use set(newData) to pass in the entire data object, with modifications made
// function setData(newData: database) {
//   data = newData;
// }

// Use get() to access the data
function getData() {
  // TODO: remove Joseph's code
  // Firstly writes whats in memory to the file to make sure its up to date..
  // fs.writeFileSync('database.json', JSON.stringify(data, null, 4));
  // return JSON.parse(fs.readFileSync('database.json'));

  if (fs.existsSync('database.json') === false) {
    // No data stored yet, so use empty data base
    return emptyData;
  }

  // Data has been stored in 'database.json'
  const storedData = fs.readFileSync('database.json', { flag: 'r' });
  const fileData: database = JSON.parse(String(storedData));

  return fileData;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: database) {
  // TODO: remove Joseph's code
  // data = newData;
  // fs.writeFileSync('database.json', JSON.stringify(data, null, 4));

  fs.writeFileSync('database.json', JSON.stringify(newData, null, 4), { flag: 'w' });
}

export { getData, setData };
