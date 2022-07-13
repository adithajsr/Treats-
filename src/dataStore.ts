// YOU SHOULD MODIFY THIS OBJECT BELOW
// let data = {
//   user: [],
//   channel: [],
// 	token: [],
// 	dm: [],
// };


let data = {
  user: [],
  channel: [
    {
    channelId: 999,
    channelName: 'channel',
    isPublic: true,
    start: 0,
    members: [
      {
        uId: -999,
        channelPerms: 2,
      },
    ],
    messages: [
      {
        messageId: 1,
        uId: -999,
        message: 'Hello world',
        timestamp: '001',
      },
    ],
  },],
	token: [
    {
      token: 'tokenstring',
      uId: 10,
    }
  ],
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
function setData(newData) {
  data = newData;
}

export { getData, setData };
