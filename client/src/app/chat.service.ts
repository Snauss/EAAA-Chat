import {Injectable}     from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Chat}           from './chat';
import {User}           from './user';
import {Room}           from './room';
import {Observable}     from 'rxjs/Observable';
// import * as io from 'socket.io-client';


@Injectable()
export class ChatService {
    // private getChatsUrl = 'message/get';  // URL to web API
    private postChatUrl = 'http://localhost:3001/message/create';  // URL to web API
    constructor(
        private http: Http
       ) {}

    // private socket;
    // private url = window.location.origin;

    /*
     * Get blog messages from server
     */
    getChats(selectedRoom): Observable<Chat[]> {
        console.log("seclecteRoom :", selectedRoom);
        let myParams = new URLSearchParams();
        myParams.append('id', selectedRoom._id);
        let options = new RequestOptions({params: myParams});
        console.log("options ", options);
        return this.http.get("http://localhost:3001/message/get?id=" + selectedRoom._id)
            .map(this.extractData)
            .catch(this.handleError);

        // let observable = new Observable(observer => {
        //     console.log("Socket:", this.url);
        //     this.socket = io(this.url);
        //     this.socket.on('refresh', (data) => {
        //         observer.next(data);
        //     });
        //     console.log(this.http);
        //     return () => {
        //         this.socket.disconnect();
        //     };
        // });
        // return observable;
    }

    getRooms(): Observable<Room[]> {
        return this.http.get("http://localhost:3001/room/get")
            .map(this.extractData)
            .catch(this.handleError);
    }

    /*
     * Send blog message to server
     */
    addChat(chat: Chat): Observable<Chat> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        console.log("chat service chat ", chat);
        return this.http.post(this.postChatUrl, chat, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    addUser(user: User): Observable<User> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.post("http://localhost:3001/user/create", user, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    addRoom(room: Room): Observable<Room> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.post("http://localhost:3001/room/create", room, options)
            .map(this.extractData)
            .catch(this.handleError);
    }


    /*
     * Data handlers
     */
    private extractData(res: Response) {
        let body = res.json();
        //console.log(body);
        return body || {};
    }

    private handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        //console.log(errMsg);
        return Observable.throw(errMsg);
    }
}
