import { getData, setData } from './dataStore';

/*
This function returns the name and members of a specified DM

Arguments: 
    token (string): To ensure the caller is an authorised user
    dmId (number): To specify which DM it is


Return: 
    Returns {error: 'error'} if the token is unauthorised or the dmId is invalid
    Returns the name and members of the specified DM if successful

*/

export function dmDetailsV1(token: string, dmId: number) {
    const data = getData();
    //checking if dmId is valid 

    const dmIndex = data.dm.findIndex(channel => channel.dmId === dmId)
    if (dmIndex === -1) return {error: 'error'};
    

   //checking that member is authorised user of DM

    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) return {error: 'error'}; 
    
    const uId = data.token[tokenIndex].uId;
    const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);

    if (memberIndex === -1) return {error: 'error'};

    return {name: data.dm[dmIndex].name, members: data.dm[dmIndex].members}
}