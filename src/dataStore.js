// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  user:[{
      uId: 37383,
      email: 'student@unsw.com',
      password: 'password',
      nameFirst: 'Grace',
      nameLast: 'Shim',
      handleStr: 'Graceshim0',
      globalPerms: 'global',
  }], 
  channel: [{
    channelId: 123,
    channelName: 'namedchannel',
    isPublic: false,
    members: [
      {
        uId: 37383,
        channelPerms: 'owner',
      }
    ],
  }]
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
