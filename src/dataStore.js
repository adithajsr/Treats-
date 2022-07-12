// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  user: [],
  channel: [],
  tokens: []
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
  fs.writeFileSync('database', JSON.stringify(data, null, 4));
  return JSON.parse(fs.readFileSync('database'));
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
  fs.writeFileSync('database', JSON.stringify(newData, null, 4));
}

export { getData, setData };
