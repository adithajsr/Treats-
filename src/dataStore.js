// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  user: [
    // {
    //   uId: 1,
    // }
  ],
  channel: [
    // {
    //   channelId: 999,
    //   channelName: 'one',
    //   members:[{
    //     uId: 12093812509,
    //   }]
    // },
    // {
    //   channelId: 999,
    //   channelName: 'two',
    // },
    // {
    //   channelId: 999,
    //   channelName: 'three',
    // }
  ]
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
