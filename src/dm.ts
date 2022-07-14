import { getData, setData } from './dataStore';

export function dmMessagesV1(token, dmId, start) {    
    //checking for valid dmId
    const dmIndex = data.dm.findIndex(channel => channel.dmId === dmId)
    if (dmIndex === -1) return {error: 'error'};

    //checking that member is authorised user of DM
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) return {error: 'error'}; 
    
    const uId = data.token[tokenIndex].uId;
    const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);

    if (memberIndex === -1) return {error: 'error'};

    messageAmount = data.dm[dmIndex].messages.length;

    if (start > messageAmount) {
        return {error: 'error'};
    } 
    
    //Storing start + 50 amount of messages in a new array to be returned 
    let returnMessages = [];

    for (let i = 0; i < start + 50; i++) {
        returnMessages[i] = data.dm[dmIndex].messages[i];
    }
    
    const endIndex = start + 50;
    if (messageAmount < endIndex) endIndex = -1;


    return {returnMessages, start, endIndex};
}







