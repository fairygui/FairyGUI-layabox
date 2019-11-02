///<reference path="UBBParser.ts"/>

namespace fgui {
    export class ToolSet {
        public static getFileName(source: string): string {
            var i: number = source.lastIndexOf("/");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf("\\");
            if (i != -1)
                source = source.substr(i + 1);
            i = source.lastIndexOf(".");
            if (i != -1)
                return source.substring(0, i);
            else
                return source;
        }

        public static startsWith(source: string, str: string, ignoreCase: boolean = false): boolean {
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(0, str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        }

        public static endsWith(source: string, str: string, ignoreCase: boolean = false): boolean {
            if (!source)
                return false;
            else if (source.length < str.length)
                return false;
            else {
                source = source.substring(source.length - str.length);
                if (!ignoreCase)
                    return source == str;
                else
                    return source.toLowerCase() == str.toLowerCase();
            }
        }

        public static trim(targetString: string): string {
            return ToolSet.trimLeft(ToolSet.trimRight(targetString));
        }

        public static trimLeft(targetString: string): string {
            var tempChar: string = "";
            for (var i: number = 0; i < targetString.length; i++) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substr(i);
        }

        public static trimRight(targetString: string): string {
            var tempChar: string = "";
            for (var i: number = targetString.length - 1; i >= 0; i--) {
                tempChar = targetString.charAt(i);
                if (tempChar != " " && tempChar != "\n" && tempChar != "\r") {
                    break;
                }
            }
            return targetString.substring(0, i + 1);
        }


        public static convertToHtmlColor(argb: number, hasAlpha: boolean = false): string {
            var alpha: string;
            if (hasAlpha)
                alpha = (argb >> 24 & 0xFF).toString(16);
            else
                alpha = "";
            var red: string = (argb >> 16 & 0xFF).toString(16);
            var green: string = (argb >> 8 & 0xFF).toString(16);
            var blue: string = (argb & 0xFF).toString(16);
            if (alpha.length == 1)
                alpha = "0" + alpha;
            if (red.length == 1)
                red = "0" + red;
            if (green.length == 1)
                green = "0" + green;
            if (blue.length == 1)
                blue = "0" + blue;
            return "#" + alpha + red + green + blue;
        }

        public static convertFromHtmlColor(str: string, hasAlpha: boolean = false): number {
            if (str.length < 1)
                return 0;

            if (str.charAt(0) == "#")
                str = str.substr(1);

            if (str.length == 8)
                return (parseInt(str.substr(0, 2), 16) << 24) + parseInt(str.substr(2), 16);
            else if (hasAlpha)
                return 0xFF000000 + parseInt(str, 16);
            else
                return parseInt(str, 16);
        }

        public static displayObjectToGObject(obj: Laya.Node): GObject {
            while (obj != null && !(obj instanceof Laya.Stage)) {
                if (obj["$owner"])
                    return obj["$owner"];

                obj = obj.parent;
            }
            return null;
        }

        public static encodeHTML(str: string): string {
            if (!str)
                return "";
            else
                return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&apos;");
        }

        public static defaultUBBParser: UBBParser = new UBBParser();
        public static parseUBB(text: string): string {
            return ToolSet.defaultUBBParser.parse(text);
        }

        public static removeUBB(text: string): string {
            return ToolSet.defaultUBBParser.parse(text, true);
        }

        public static clamp(value: number, min: number, max: number): number {
            if (value < min)
                value = min;
            else if (value > max)
                value = max;
            return value;
        }

        public static clamp01(value: number): number {
            if (isNaN(value))
                value = 0;
            else if (value > 1)
                value = 1;
            else if (value < 0)
                value = 0;
            return value;
        }

        public static lerp(start: number, end: number, percent: number): number {
            return (start + percent * (end - start));
        }

        public static repeat(t: number, length: number): number {
            return t - Math.floor(t / length) * length;
        }

        public static distance(x1: number, y1: number, x2: number, y2: number): number {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }

        public static setColorFilter(obj: Laya.Sprite, color?: string | number[] | boolean): void {
            var filter: Laya.ColorFilter = (<any>obj).$_colorFilter_; //cached instance
            var filters: any[] = obj.filters;

            var toApplyColor: any;
            var toApplyGray: boolean;
            var tp: string = typeof (color);
            if (tp == "boolean") //gray
            {
                toApplyColor = filter ? (<any>filter).$_color_ : null;
                toApplyGray = <boolean>color;
            }
            else {
                if (tp == "string") {
                    var arr: any[] = Laya.ColorUtils.create(color).arrColor;
                    if (arr[0] == 1 && arr[1] == 1 && arr[2] == 1)
                        color = null;
                    else {
                        color = [arr[0], 0, 0, 0, 0,
                            0, arr[1], 0, 0, 0,
                            0, 0, arr[2], 0, 0,
                            0, 0, 0, 1, 0];
                    }
                }
                toApplyColor = color;
                toApplyGray = filter ? (<any>filter).$_grayed_ : false;
            }

            if ((!toApplyColor && toApplyColor != 0) && !toApplyGray) {
                if (filters && filter) {
                    let i: number = filters.indexOf(filter);
                    if (i != -1) {
                        filters.splice(i, 1);
                        if (filters.length > 0)
                            obj.filters = filters;
                        else
                            obj.filters = null;
                    }
                }
                return;
            }

            if (!filter) {
                filter = new Laya.ColorFilter();
                (<any>obj).$_colorFilter_ = filter;
            }
            if (!filters)
                filters = [filter];
            else {
                let i: number = filters.indexOf(filter);
                if (i == -1)
                    filters.push(filter);
            }
            obj.filters = filters;

            (<any>filter).$_color_ = toApplyColor;
            (<any>filter).$_grayed_ = toApplyGray;

            filter.reset();

            if (toApplyGray)
                filter.gray();
            else if (toApplyColor.length == 20)
                filter.setByMatrix(toApplyColor);
            else
                filter.setByMatrix(ColorMatrix.getMatrix(toApplyColor[0], toApplyColor[1], toApplyColor[2], toApplyColor[3]));
        }
    }
}