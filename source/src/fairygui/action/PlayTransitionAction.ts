namespace fgui {
    export class PlayTransitionAction extends ControllerAction {
        public transitionName: string;
        public playTimes: number;
        public delay: number;
        public stopOnExit: boolean;

        private _currentTransition?: Transition;

        constructor() {
            super();
        }

        protected enter(controller: Controller): void {
            var trans: Transition = controller.parent.getTransition(this.transitionName);
            if (trans) {
                if (this._currentTransition && this._currentTransition.playing)
                    trans.changePlayTimes(this.playTimes);
                else
                    trans.play(null, this.playTimes, this.delay);
                this._currentTransition = trans;
            }
        }

        protected leave(controller: Controller): void {
            if (this.stopOnExit && this._currentTransition) {
                this._currentTransition.stop();
                this._currentTransition = null;
            }
        }

        public setup(buffer: ByteBuffer): void {
            super.setup(buffer);

            this.transitionName = buffer.readS();
            this.playTimes = buffer.getInt32();
            this.delay = buffer.getFloat32();
            this.stopOnExit = buffer.readBool();
        }
    }
}