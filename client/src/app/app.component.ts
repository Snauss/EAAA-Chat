import {Component, OnInit} from '@angular/core';
import {Chat} from './chat';
import {User} from './user';
import {Room} from './room';
import './rxjs-operators';
import {ChatService} from './chat.service';
import {current} from "codelyzer/util/syntaxKind";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ChatService]
})
export class AppComponent implements OnInit {
    isSubmitted = false;
    title = 'MEAN app with Socket IO';
    model: Chat;
    public chatMessages = [];
    public chatRooms:Array<Room>;
    tmpRoom : Room;
    author: User;
    currentRoom: Room;

    constructor(private chatService: ChatService) {
    }

    selectRoom(selectedRoom){
        this.currentRoom = this.chatRooms.filter(x => x._id == selectedRoom)[0];
        console.log("this is the selected room",this.currentRoom)
        this.getChats();
    }

    createRoom(){
        this.chatService.addRoom(this.tmpRoom)
            .subscribe(room => {
                    this.tmpRoom = room;
                    console.log("the room :", room)
                },
                error => this.title = <any>error
            )
    }

    createUser() {
        this.chatService.addUser(this.author)
            .subscribe(user => {
                    this.author = user;
                    console.log("the user :", user)
                },
                error => this.title = <any>error
            )
    }

    submitChat() {

        this.model.room = this.currentRoom;
        this.model.author = this.author;
        console.log(this.model);
        this.chatService.addChat(this.model)
            .subscribe(
                chatMsg => {
                    // console.log("Messages:", messages);
                    this.model = chatMsg;
                    // this.getBlogs();
                },
                error => this.title = <any>error
            );
    }

    getChats() {
        console.log('Subscribe to service');
        this.chatService.getChats(this.currentRoom)
            .subscribe(
                messages => {
                    console.log("Messages: ", messages);
                    this.chatMessages = messages;
                },
                error => this.title = <any>error
            );
    };

    getRooms() {
        console.log('Subscribe to service');
        this.chatService.getRooms()
            .subscribe(
                rooms => {
                    console.log("Messages: ", rooms);
                    this.chatRooms = rooms;
                },
                error => this.title = <any>error
            );
    }


    ngOnInit() {
        this.getRooms();
        this.author = new User();
        this.model = new Chat();
        this.currentRoom = new Room();
        this.tmpRoom = new Room;
    }
}
