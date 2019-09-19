namespace fgui {
    export class GearBase {
        public static disableAllTweenEffect: boolean = false;

        protected _owner: GObject;
        protected _controller: Controller;
        protected _tweenConfig: GearTweenConfig;

        constructor(owner: GObject) {
            this._owner = owner;
        }

        public dispose(): void {
            if (this._tweenConfig != null && this._tweenConfig._tweener != null) {
                this._tweenConfig._tweener.kill();
                this._tweenConfig._tweener = null;
            }
        }

        public get controller(): Controller {
            return this._controller;
        }

        public set controller(val: Controller) {
            if (val != this._controller) {
                this._controller = val;
                if (this._controller)
                    this.init();
            }
        }

        public get tweenConfig(): GearTweenConfig {
            if (this._tweenConfig == null)
                this._tweenConfig = new GearTweenConfig();
            return this._tweenConfig;
        }

        public setup(buffer: ByteBuffer): void {
            this._controller = this._owner.parent.getControllerAt(buffer.getInt16());
            this.init();

            var cnt: number;
            var i: number;
            var page: string;

            if (this instanceof GearDisplay) {
                cnt = buffer.getInt16();
                var pages: any[] = [];
                for (i = 0; i < cnt; i++)
                    pages[i] = buffer.readS();
                (<GearDisplay>(this)).pages = pages;
            }
            else {
                cnt = buffer.getInt16();
                for (i = 0; i < cnt; i++) {
                    page = buffer.readS();
                    if (page == null)
                        continue;

                    this.addStatus(page, buffer);
                }

                if (buffer.readBool())
                    this.addStatus(null, buffer);
            }

            if (buffer.readBool()) {
                this._tweenConfig = new GearTweenConfig();
                this._tweenConfig.easeType = buffer.readByte();
                this._tweenConfig.duration = buffer.getFloat32();
                this._tweenConfig.delay = buffer.getFloat32();
            }
        }

        public updateFromRelations(dx: number, dy: number): void {

        }

        protected addStatus(pageId: string, buffer: ByteBuffer): void {

        }

        protected init(): void {

        }

        public apply(): void {
        }

        public updateState(): void {
        }
    }


    export class GearTweenConfig {
        public tween: boolean;
        public easeType: number;
        public duration: number;
        public delay: number;

        public _displayLockToken: number;
        public _tweener: GTweener;

        constructor() {
            this.tween = true;
            this.easeType = EaseType.QuadOut;
            this.duration = 0.3;
            this.delay = 0;
        }
    }
}