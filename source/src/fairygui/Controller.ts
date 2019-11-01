namespace fgui {
    export class Controller extends Laya.EventDispatcher {
        private _selectedIndex: number = 0;
        private _previousIndex: number = 0;
        private _pageIds: string[];
        private _pageNames: string[];
        private _actions: ControllerAction[];

        public name: string;
        public parent: GComponent;
        public autoRadioGroupDepth: boolean;

        public changing: boolean = false;

        private static _nextPageId: number = 0;

        constructor() {
            super();
            this._pageIds = [];
            this._pageNames = [];
            this._selectedIndex = -1;
            this._previousIndex = -1;
        }

        public dispose(): void {
            this.offAll();
        }

        public get selectedIndex(): number {
            return this._selectedIndex;
        }

        public set selectedIndex(value: number) {
            if (this._selectedIndex != value) {
                if (value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;

                this.changing = true;
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this.parent.applyController(this);

                this.event(Events.STATE_CHANGED, this);

                this.changing = false;
            }
        }

        //功能和设置selectedIndex一样，但不会触发事件
        public setSelectedIndex(value: number = 0): void {
            if (this._selectedIndex != value) {
                if (value > this._pageIds.length - 1)
                    throw "index out of bounds: " + value;

                this.changing = true;
                this._previousIndex = this._selectedIndex;
                this._selectedIndex = value;
                this.parent.applyController(this);
                this.changing = false;
            }
        }

        public get previsousIndex(): number {
            return this._previousIndex;
        }

        public get selectedPage(): string {
            if (this._selectedIndex == -1)
                return null;
            else
                return this._pageNames[this._selectedIndex];
        }

        public set selectedPage(val: string) {
            var i: number = this._pageNames.indexOf(val);
            if (i == -1)
                i = 0;
            this.selectedIndex = i;
        }

        //功能和设置selectedPage一样，但不会触发事件
        public setSelectedPage(value: string): void {
            var i: number = this._pageNames.indexOf(value);
            if (i == -1)
                i = 0;
            this.setSelectedIndex(i);
        }

        public get previousPage(): string {
            if (this._previousIndex == -1)
                return null;
            else
                return this._pageNames[this._previousIndex];
        }

        public get pageCount(): number {
            return this._pageIds.length;
        }

        public getPageName(index: number = 0): string {
            return this._pageNames[index];
        }

        public addPage(name: string = ""): void {
            this.addPageAt(this.name, this._pageIds.length);
        }

        public addPageAt(name: string, index: number = 0): void {
            var nid: string = "" + (Controller._nextPageId++);
            if (index == this._pageIds.length) {
                this._pageIds.push(nid);
                this._pageNames.push(this.name);
            }
            else {
                this._pageIds.splice(index, 0, nid);
                this._pageNames.splice(index, 0, this.name);
            }
        }

        public removePage(name: string): void {
            var i: number = this._pageNames.indexOf(this.name);
            if (i != -1) {
                this._pageIds.splice(i, 1);
                this._pageNames.splice(i, 1);
                if (this._selectedIndex >= this._pageIds.length)
                    this.selectedIndex = this._selectedIndex - 1;
                else
                    this.parent.applyController(this);
            }
        }

        public removePageAt(index: number = 0): void {
            this._pageIds.splice(index, 1);
            this._pageNames.splice(index, 1);
            if (this._selectedIndex >= this._pageIds.length)
                this.selectedIndex = this._selectedIndex - 1;
            else
                this.parent.applyController(this);
        }

        public clearPages(): void {
            this._pageIds.length = 0;
            this._pageNames.length = 0;
            if (this._selectedIndex != -1)
                this.selectedIndex = -1;
            else
                this.parent.applyController(this);
        }

        public hasPage(aName: string): boolean {
            return this._pageNames.indexOf(aName) != -1;
        }

        public getPageIndexById(aId: string): number {
            return this._pageIds.indexOf(aId);
        }

        public getPageIdByName(aName: string): string {
            var i: number = this._pageNames.indexOf(aName);
            if (i != -1)
                return this._pageIds[i];
            else
                return null;
        }

        public getPageNameById(aId: string): string {
            var i: number = this._pageIds.indexOf(aId);
            if (i != -1)
                return this._pageNames[i];
            else
                return null;
        }

        public getPageId(index: number = 0): string {
            return this._pageIds[index];
        }

        public get selectedPageId(): string {
            if (this._selectedIndex == -1)
                return null;
            else
                return this._pageIds[this._selectedIndex];
        }

        public set selectedPageId(val: string) {
            var i: number = this._pageIds.indexOf(val);
            this.selectedIndex = i;
        }

        public set oppositePageId(val: string) {
            var i: number = this._pageIds.indexOf(val);
            if (i > 0)
                this.selectedIndex = 0;
            else if (this._pageIds.length > 1)
                this.selectedIndex = 1;
        }

        public get previousPageId(): string {
            if (this._previousIndex == -1)
                return null;
            else
                return this._pageIds[this._previousIndex];
        }

        public runActions(): void {
            if (this._actions) {
                var cnt: number = this._actions.length;
                for (var i: number = 0; i < cnt; i++) {
                    this._actions[i].run(this, this.previousPageId, this.selectedPageId);
                }
            }
        }

        public setup(buffer: ByteBuffer): void {
            var beginPos: number = buffer.pos;
            buffer.seek(beginPos, 0);

            this.name = buffer.readS();
            this.autoRadioGroupDepth = buffer.readBool();

            buffer.seek(beginPos, 1);

            var i: number;
            var nextPos: number;
            var cnt: number = buffer.getInt16();

            for (i = 0; i < cnt; i++) {
                this._pageIds.push(buffer.readS());
                this._pageNames.push(buffer.readS());
            }

            var homePageIndex: number = 0;
            if (buffer.version >= 2) {
                var homePageType: number = buffer.getByte();
                switch (homePageType) {
                    case 1:
                        homePageIndex = buffer.getInt16();
                        break;

                    case 2:
                        homePageIndex = this._pageNames.indexOf(UIPackage.branch);
                        if (homePageIndex == -1)
                            homePageIndex = 0;
                        break;

                    case 3:
                        homePageIndex = this._pageNames.indexOf(UIPackage.getVar(buffer.readS()));
                        if (homePageIndex == -1)
                            homePageIndex = 0;
                        break;
                }
            }

            buffer.seek(beginPos, 2);

            cnt = buffer.getInt16();
            if (cnt > 0) {
                if (this._actions == null)
                    this._actions = [];

                for (i = 0; i < cnt; i++) {
                    nextPos = buffer.getInt16();
                    nextPos += buffer.pos;

                    var action: ControllerAction = ControllerAction.createAction(buffer.readByte());
                    action.setup(buffer);
                    this._actions.push(action);

                    buffer.pos = nextPos;
                }
            }

            if (this.parent != null && this._pageIds.length > 0)
                this._selectedIndex = homePageIndex;
            else
                this._selectedIndex = -1;
        }
    }

}