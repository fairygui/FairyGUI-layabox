
export class EmojiParser extends fgui.UBBParser {

    public constructor() {
        super();

        TAGS.forEach(element => {
            this._handlers[":" + element] = this.onTag_Emoji;
        });
    }

    private onTag_Emoji(tagName: string, end: boolean, attr: string): string {
        let i = TAGS.indexOf(tagName.substring(1).toLowerCase()).toString();
        if (i.length == 1)
            i = "0" + i;
        return "<img src='" + fgui.UIPackage.getItemURL("Chat", "1f6" + i) + "'/>";
    }
}

const TAGS: Array<string> = ["88", "am", "bs", "bz", "ch", "cool", "dhq", "dn", "fd", "gz", "han", "hx", "hxiao", "hxiu"];
