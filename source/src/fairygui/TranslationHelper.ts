namespace fgui {
    export class TranslationHelper {
        public static strings: { [index: string]: { [index: string]: string } };

        constructor() {
        }

        public static loadFromXML(source: string): void {
            let strings = {};
            TranslationHelper.strings = strings;

            var xml: any = Laya.Utils.parseXMLFromString(source);
            var resNode: any = findChildNode(xml, "resources");
            var nodes: any[] = resNode.childNodes;
            var length1: number = nodes.length;
            for (var i1: number = 0; i1 < length1; i1++) {
                var cxml: any = nodes[i1];
                if (cxml.nodeName == "string") {
                    var key: string = cxml.getAttribute("name");
                    var text: string = cxml.textContent;
                    var i: number = key.indexOf("-");
                    if (i == -1)
                        continue;

                    var key2: string = key.substr(0, i);
                    var key3: string = key.substr(i + 1);
                    var col: Object = strings[key2];
                    if (!col) {
                        col = {};
                        strings[key2] = col;
                    }
                    col[key3] = text;
                }
            }
        }

        public static translateComponent(item: PackageItem): void {
            if (TranslationHelper.strings == null)
                return;

            var compStrings: { [index: string]: string } = TranslationHelper.strings[item.owner.id + item.id];
            if (compStrings == null)
                return;

            var elementId: string, value: string;
            var buffer: ByteBuffer = item.rawData;
            var nextPos: number;
            var itemCount: number;
            var i: number, j: number, k: number;
            var dataLen: number;
            var curPos: number;
            var valueCnt: number;
            var page: string;

            buffer.seek(0, 2);

            var childCount: number = buffer.getInt16();
            for (i = 0; i < childCount; i++) {
                dataLen = buffer.getInt16();
                curPos = buffer.pos;

                buffer.seek(curPos, 0);

                var baseType: number = buffer.readByte();
                var type: number = baseType;
                buffer.skip(4);
                elementId = buffer.readS();

                if (type == ObjectType.Component) {
                    if (buffer.seek(curPos, 6))
                        type = buffer.readByte();
                }

                buffer.seek(curPos, 1);

                if ((value = compStrings[elementId + "-tips"]) != null)
                    buffer.writeS(value);

                buffer.seek(curPos, 2);

                var gearCnt: number = buffer.getInt16();
                for (j = 0; j < gearCnt; j++) {
                    nextPos = buffer.getInt16();
                    nextPos += buffer.pos;

                    if (buffer.readByte() == 6) //gearText
                    {
                        buffer.skip(2);//controller
                        valueCnt = buffer.getInt16();
                        for (k = 0; k < valueCnt; k++) {
                            page = buffer.readS();
                            if (page != null) {
                                if ((value = compStrings[elementId + "-texts_" + k]) != null)
                                    buffer.writeS(value);
                                else
                                    buffer.skip(2);
                            }
                        }

                        if (buffer.readBool() && (value = compStrings[elementId + "-texts_def"]) != null)
                            buffer.writeS(value);
                    }

                    buffer.pos = nextPos;
                }

                if (baseType == ObjectType.Component && buffer.version >= 2) {
                    buffer.seek(curPos, 4);

                    buffer.skip(2); //pageController

                    buffer.skip(4 * buffer.getUint16());

                    var cpCount: number = buffer.getUint16();
                    for (var k: number = 0; k < cpCount; k++) {
                        var target: string = buffer.readS();
                        var propertyId: number = buffer.getUint16();
                        if (propertyId == 0 && (value = compStrings[elementId + "-cp-" + target]) != null)
                            buffer.writeS(value);
                        else
                            buffer.skip(2);
                    }
                }

                switch (type) {
                    case ObjectType.Text:
                    case ObjectType.RichText:
                    case ObjectType.InputText:
                        {
                            if ((value = compStrings[elementId]) != null) {
                                buffer.seek(curPos, 6);
                                buffer.writeS(value);
                            }
                            if ((value = compStrings[elementId + "-prompt"]) != null) {
                                buffer.seek(curPos, 4);
                                buffer.writeS(value);
                            }
                            break;
                        }

                    case ObjectType.List:
                    case ObjectType.Tree:
                        {
                            buffer.seek(curPos, 8);
                            buffer.skip(2);
                            itemCount = buffer.getUint16();
                            for (j = 0; j < itemCount; j++) {
                                nextPos = buffer.getUint16();
                                nextPos += buffer.pos;

                                buffer.skip(2); //url
                                if (type == ObjectType.Tree)
                                    buffer.skip(2);

                                //title
                                if ((value = compStrings[elementId + "-" + j]) != null)
                                    buffer.writeS(value);
                                else
                                    buffer.skip(2);

                                //selected title
                                if ((value = compStrings[elementId + "-" + j + "-0"]) != null)
                                    buffer.writeS(value);
                                else
                                    buffer.skip(2);

                                if (buffer.version >= 2) {
                                    buffer.skip(6);
                                    buffer.skip(buffer.getUint16() * 4);//controllers

                                    var cpCount: number = buffer.getUint16();
                                    for (var k: number = 0; k < cpCount; k++) {
                                        var target: string = buffer.readS();
                                        var propertyId: number = buffer.getUint16();
                                        if (propertyId == 0 && (value = compStrings[elementId + "-" + j + "-" + target]) != null)
                                            buffer.writeS(value);
                                        else
                                            buffer.skip(2);
                                    }
                                }

                                buffer.pos = nextPos;
                            }
                            break;
                        }

                    case ObjectType.Label:
                        {
                            if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                                if ((value = compStrings[elementId]) != null)
                                    buffer.writeS(value);
                                else
                                    buffer.skip(2);

                                buffer.skip(2);
                                if (buffer.readBool())
                                    buffer.skip(4);
                                buffer.skip(4);
                                if (buffer.readBool() && (value = compStrings[elementId + "-prompt"]) != null)
                                    buffer.writeS(value);
                            }
                            break;
                        }

                    case ObjectType.Button:
                        {
                            if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                                if ((value = compStrings[elementId]) != null)
                                    buffer.writeS(value);
                                else
                                    buffer.skip(2);
                                if ((value = compStrings[elementId + "-0"]) != null)
                                    buffer.writeS(value);
                            }
                            break;
                        }

                    case ObjectType.ComboBox:
                        {
                            if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
                                itemCount = buffer.getInt16();
                                for (j = 0; j < itemCount; j++) {
                                    nextPos = buffer.getInt16();
                                    nextPos += buffer.pos;

                                    if ((value = compStrings[elementId + "-" + j]) != null)
                                        buffer.writeS(value);

                                    buffer.pos = nextPos;
                                }

                                if ((value = compStrings[elementId]) != null)
                                    buffer.writeS(value);
                            }

                            break;
                        }
                }

                buffer.pos = curPos + dataLen;
            }
        }
    }

    function findChildNode(xml: any, name: string): Object {
        var col: any[] = xml.childNodes;
        var length1: number = col.length;
        if (length1 > 0) {
            for (var i1: number = 0; i1 < length1; i1++) {
                var cxml: any = col[i1];
                if (cxml.nodeName == name) {
                    return cxml;
                }
            }
        }

        return null;
    }
}