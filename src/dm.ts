import { getData, setData } from './dataStore';

export function dmLeaveV1(token, dmId) {
    const data = getData();

    //checking for valid dmId
    const dmIndex = data.dm.findIndex(channel => channel.dmId === dmId)
    if (dmIndex === -1) return {error: 'error'};

    //checking that member is authorised user of DM
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) return {error: 'error'}; 
    
    const uId = data.token[tokenIndex].uId;
    const memberIndex = data.dm[dmIndex].members.findIndex(a => a.uId === uId);

    if (memberIndex === -1) return {error: 'error'};
    //removes member from members array in DM array 
    data.dm[dmIndex].members.splice(memberIndex, 1);

    setData(data);

    return {};
}