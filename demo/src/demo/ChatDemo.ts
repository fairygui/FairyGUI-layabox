import HitTestDemo from "./HitTestDemo";
import EmojiParser from "./EmojiParser";

class Message {
    public sender: string;
    public senderIcon: string;
    public msg: string;
    public fromMe: boolean;
}

export default class ChatDemo {
    private _view: fgui.GComponent;
    private _list: fgui.GList;
    private _input: fgui.GTextInput;
    private _emojiSelectUI: fgui.GComponent;
    private _emojiParser: EmojiParser;
    private _messages: Array<Message>;

    constructor() {
        fgui.UIPackage.loadPackage("res/UI/Chat", Laya.Handler.create(this, this.onUILoaded));
    }

    onUILoaded() {
        this._view = fgui.UIPackage.createObject("Chat", "Main").asCom;
        this._view.makeFullScreen();
        fgui.GRoot.inst.addChild(this._view);

        this._messages = new Array<Message>();
        this._emojiParser = new EmojiParser();

        this._list = this._view.getChild("list").asList;
        this._list.setVirtual();
        this._list.itemProvider = Laya.Handler.create(this, this.getListItemResource, null, false);
        this._list.itemRenderer = Laya.Handler.create(this, this.renderListItem, null, false);

        this._input = this._view.getChild("input1").asTextInput;
        this._input.nativeInput.on(Laya.Event.ENTER, this, this.onSubmit);

        this._view.getChild("btnSend1").onClick(this, this.onClickSendBtn);
        this._view.getChild("btnEmoji1").onClick(this, this.onClickEmojiBtn);

        this._emojiSelectUI = fgui.UIPackage.createObject("Chat", "EmojiSelectUI").asCom;
        this._emojiSelectUI.getChild("list").on(fgui.Events.CLICK_ITEM, this, this.onClickEmoji);
    }

    private addMsg(sender: string, senderIcon: string, msg: string, fromMe: boolean) {
        let isScrollBottom: boolean = this._list.scrollPane.isBottomMost;

        let newMessage = new Message();
        newMessage.sender = sender;
        newMessage.senderIcon = senderIcon;
        newMessage.msg = msg;
        newMessage.fromMe = fromMe;
        this._messages.push(newMessage);

        if (newMessage.fromMe) {
            if (this._messages.length == 1 || Math.random() < 0.5) {
                let replyMessage = new Message();
                replyMessage.sender = "FairyGUI";
                replyMessage.senderIcon = "r1";
                replyMessage.msg = "Today is a good day. ";
                replyMessage.fromMe = false;
                this._messages.push(replyMessage);
            }
        }

        if (this._messages.length > 100)
            this._messages.splice(0, this._messages.length - 100);

        this._list.numItems = this._messages.length;

        if (isScrollBottom)
            this._list.scrollPane.scrollBottom();
    }

    private getListItemResource(index: number): string {
        let msg = this._messages[index];
        if (msg.fromMe)
            return "ui://Chat/chatRight";
        else
            return "ui://Chat/chatLeft";
    }

    private renderListItem(index: number, item: fgui.GButton): void {
        let msg = this._messages[index];
        if (!msg.fromMe)
            item.getChild("name").text = msg.sender;
        item.icon = fgui.UIPackage.getItemURL("Chat", msg.senderIcon);

        var txtObj:fgui.GRichTextField = item.getChild("msg").asRichTextField;
        txtObj.width = txtObj.initWidth;
        txtObj.text = this._emojiParser.parse(msg.msg);
        if(txtObj.textWidth<txtObj.width)
            txtObj.width = txtObj.textWidth;
    }

    private onClickSendBtn() {
        let msg = this._input.text;
        if (!msg)
            return;

        this.addMsg("Creator", "r0", msg, true);
        this._input.text = "";
    }

    private onClickEmojiBtn(evt: Laya.Event) {
        fgui.GRoot.inst.showPopup(this._emojiSelectUI, fgui.GObject.cast(evt.currentTarget), false);
    }

    private onClickEmoji(item: fgui.GObject) {
        this._input.text += "[:" + item.text + "]";
    }

    private onSubmit() {
        this.onClickSendBtn();
    }
}
