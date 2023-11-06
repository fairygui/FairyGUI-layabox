namespace fgui {
    let _func: Function = Laya.HitArea["_isHitGraphic"];

    export class ChildHitArea extends Laya.HitArea {

        private _child: Laya.Sprite;
        private _reversed: boolean;

        constructor(child: Laya.Sprite, reversed?: boolean) {
            super();

            this._child = child;
            this._reversed = reversed;

            if (this._reversed)
                this.unHit = (<Laya.HitArea>child.hitArea).hit;
            else
                this.hit = (<Laya.HitArea>child.hitArea).hit;
        }

        public contains(x: number, y: number, sp: Laya.Sprite): boolean {
            var tPos: Laya.Point;
            tPos = Laya.Point.TEMP;
            tPos.setTo(0, 0);
            tPos = this._child.toParentPoint(tPos);
            if (this._reversed)
                return !_func(x - tPos.x, y - tPos.y, sp, this.unHit);
            else
                return _func(x - tPos.x, y - tPos.y, sp, this.hit);
        }
    }
}