import { getData, setData } from './dataStore';
//IS MEMBERS TYPE CORRECT?
//DID I USE THE INTERFACE CORRECTLY?
interface retValue {
    name: string, 
    members: any,
}
export function dmDetailsV1(token, dmId): retValue {
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