import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';


export function searchV1(token: string, queryStr: string) {
/*
    validates token

    create new array

    searches through each channel the user is in
    if (message.contains(queryStr)) {
        stores message in returnArray 
    }

    searches through each dm the user is in
    if (message.contains(queryStr)) {
        stores message in returnArray   
    }

    return returnArray


*/
    const data = getData();
    //finding correct user 
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
    const uId = data.token[tokenIndex].uId;
    const userIndex = data.user.findIndex(a => a.uId === uId);
    

    let messages = [];

    for (element of data.channel) {
        const memberIndex = element[channelIndex].members.findIndex(a => a.uId === uId);
        if (memberIndex != -1) {
            for (element2 of element.messages) {
                if (element2.message.includes(queryStr) === true) messages.push(element2.message);
            }
        }
    }

    for (element of data.dm) {
        const memberIndex = element[dmIndex].members.findIndex(a => a.uId === uId);
        if (memberIndex != -1) {
            for (element2 of element.messages) {
                if (element2.message.includes(queryStr) === true) messages.push(element2.message);
            }
        }
    }
    return messages;
}