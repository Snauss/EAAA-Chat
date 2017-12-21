import {Component, AfterViewChecked, ElementRef, ViewChild, OnInit} from '@angular/core';
import {Chat} from './chat';
import {User} from './user';
import {Room} from './room';

import './rxjs-operators';
import {ChatService} from './chat.service';
// import {current} from "codelyzer/util/syntaxKind";

import {Socket} from 'ng-socket-io';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {current} from "codelyzer/util/syntaxKind";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ChatService]
})
export class AppComponent implements OnInit {
    closeResult: string;

    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    isSubmitted = false;
    title = 'Welcome to EAAA-Chat';
    model: Chat;
    public chatMessages = [];
    public chatRooms: Array<Room>;
    tmpRoom: Room;
    newUser: User;

    currentRoom: Room;
    currentUser: User;

    warnRoomName: string;
    warnRoomDesc: string;

    constructor(private chatService: ChatService,
                private modalService: NgbModal,
                private socket: Socket) {
    }

    // Open model
    open(roomCreater) {
        this.modalService.open(roomCreater).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    // get dismiss reason
    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    selectRoom(selectedRoom) {
        this.currentRoom = this.chatRooms.filter(x => x._id == selectedRoom)[0];
        // console.log("this is the selected room",this.currentRoom)
        this.getChats();
        console.log("selected room ", selectedRoom)
    }

    createRoom() {
        if (!this.tmpRoom.name) {
            this.warnRoomName = "Room name required";
            this.warnRoomDesc = "";
            return console.log("No room name");
        }
        if (!this.tmpRoom.description) {
            this.warnRoomName = "";
            this.warnRoomDesc = "Room Description required";
            return console.log("no desc")
        }
        if (this.tmpRoom.name && this.tmpRoom.description) {
            this.warnRoomName = "";
            this.warnRoomDesc = "";
            this.chatService.addRoom(this.tmpRoom)
                .subscribe(room => {
                        this.tmpRoom = room;
                        this.getRooms();
                        this.tmpRoom = new Room();
                        document.getElementById("modalCloseBtn").click();
                    },
                    error => this.title = <any>error
                );
        }
    }

    createUser() {
        if(!this.newUser.userName){
            return console.log("A user needs a name ");
        }else{
        this.chatService.addUser(this.newUser)
            .subscribe(user => {
                    this.currentUser = user;
                    localStorage.setItem("user", JSON.stringify(user));
                    console.log("the user :", user)
                },
                error => this.title = <any>error
            )
        }
    }

    changeUser() {
        this.currentUser = new User;
    }

    submitChat() {
        this.model.room = this.currentRoom;
        this.model.author = this.currentUser;
        // console.log(this.model);
        this.chatService.addChat(this.model)
            .subscribe(
                chatMsg => {
                    console.log("Messages: ", chatMsg);

                    this.model.messageBody = "";
                },
                error => this.title = <any>error
            );

    }

    getChats() {
        console.log('Subscribe to service');
        this.chatService.getChats(this.currentRoom)
            .subscribe(
                messages => {
                    // console.log("Messages: ", messages);
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
                    // console.log("Rooms: ", rooms);
                    this.chatRooms = rooms;
                },
                error => this.title = <any>error
            );
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) {
        }
    }

    ngOnInit() {
        this.getRooms();
        this.model = new Chat();
        this.currentRoom = new Room();
        this.tmpRoom = new Room();
        this.newUser = new User();
        this.currentUser = new User();
        let localUser = localStorage.getItem("user");
        if (localUser) {
            this.currentUser = JSON.parse(localUser);
        }
        this.socket.on("newMessage", message => {
            if (message.room._id === this.currentRoom._id) {
                this.scrollToBottom();
                this.chatMessages.push(message);
            }
            console.log("this is the new message ", message)
        });
    }
}
