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

export interface standupmessage {
  handle: string,
  message: string
}

interface channel {
  channelId: number,
  channelName: string,
  isPublic: boolean,
  isActive: boolean,
  standupFinish: number,
  members: channelMember[],
  messages: message[],
  queue: standupmessage[]
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

// Use get() to access the data
function getData() {
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
  fs.writeFileSync('database.json', JSON.stringify(newData, null, 4), { flag: 'w' });
}

export { getData, setData };
export { user, channelMember, dmMember, message, channel, token, dm, database };
