type user = {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  handle: string,
  globalPerms: number,
};

type channelMember = {
  uId: number,
  channelPerms: number,
}

type dmMember = {
  uId: number,
  dmPerms: number,
}

type message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

type channel = {
  channelId: number,
  channelName: string,
  isPublic: boolean,
  start: number,
  members: channelMember[],
  messages: message[],
}

type token = {
  token: string,
  uId: number,
}

type dm = {
  dmId: number,
  name: string,
  members: dmMember[],
  messages: message[],
}

type database = {
  user: user[],
  channel: channel[],
  token: token[],
  dm: dm[],
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: database = {
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
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: database) {
  data = newData;
}

export { getData, setData };
