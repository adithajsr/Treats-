let data = {
  user: [],
  channel: [],
  token: [],
  dm: []
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


// Use get() to access the data. Firstly writes whats in memory to the file to make sure its up to date..
function getData() {
  fs.writeFileSync('database.json', JSON.stringify(data, null, 4)); 
  return JSON.parse(fs.readFileSync('database.json'));
}

// Use set(newData) to pass in the entire data object, with modifications made.
function setData(newData) {
  data = newData;
  fs.writeFileSync('database.json', JSON.stringify(data, null, 4));
}

export { getData, setData };
