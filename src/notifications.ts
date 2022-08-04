import { getData, setData } from './dataStore'
import HTTPError from 'http-errors';

export function notificationsGetV1(token: string) {
    const data = getData();
    
    //finding correct user 
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
    const uId = data.token[tokenIndex].uId;
    const userIndex = data.user.findIndex(a => a.uId === uId);

    let notifications = [];
    const notificationNumber = data.user[userIndex].notifications.length;

    for (let i = 0; i < 20; i++) {
        if (i >= notificationNumber) break;
        notifications.push(data.user[userIndex].notifications[i]);
    }
    
    return notifications;
}