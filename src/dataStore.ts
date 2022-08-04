import fs from 'fs';

interface notification {
  channelId: number,
  dmId: number,
  notificationMessage: string,
}

interface channelJoined {
  numChannelsJoined: number,
  timeStamp: number,
}

interface dmJoined {
  numDmsJoined: number,
  timeStamp: number,
}

interface messageSent {
  numMessagesSent: number,
  timeStamp: number,
}

interface user {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  handle: string,
  globalPerms: number,
  notifications: notification[],
  channelsJoined: channelJoined[],
  dmsJoined: dmJoined[],
  messagesSent: messageSent[],
  involvementRate: number,
  shouldRetrieve: boolean
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
  isPinned: number,
  reacts: [],
}

interface channel {
  channelId: number,
  channelName: string,
  isPublic: boolean,
  isActive: boolean,
  isActiveUid: number,
  standupFinish: number,
  members: channelMember[],
  messages: message[],
  queue: any
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

interface channelExist {
  numChannelsExist: number,
  timeStamp: number,
}

interface dmExist {
  numDmsExist: number,
  timeStamp: number,
}

interface messageExist {
  numMessagesExist: number,
  timeStamp: number,
}

interface database {
  user: user[],
  channel: channel[],
  token: token[],
  dm: dm[],
  workspaceStats: {
    channelsExist: channelExist[],
    dmsExist: dmExist[],
    messagesExist: messageExist[],
    utilizationRate: number,
  }
}

const emptyData: database = {
  user: [],
  channel: [],
  token: [],
  dm: [],
  workspaceStats: {
    channelsExist: [],
    dmsExist: [],
    messagesExist: [],
    utilizationRate: 0,
  },
};

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
