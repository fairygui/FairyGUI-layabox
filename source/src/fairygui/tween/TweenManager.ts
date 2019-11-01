namespace fgui {
    export class TweenManager {
        private static _activeTweens: GTweener[] = new Array();
        private static _tweenerPool: GTweener[] = [];
        private static _totalActiveTweens: number = 0;
        private static _inited: boolean = false;

        public static createTween(): GTweener {
            if (!TweenManager._inited) {
                Laya.timer.frameLoop(1, null, TweenManager.update);
                TweenManager._inited = true;
            }

            var tweener: GTweener;
            var cnt: number = TweenManager._tweenerPool.length;
            if (cnt > 0) {
                tweener = TweenManager._tweenerPool.pop();
            }
            else
                tweener = new GTweener();
            tweener._init();
            TweenManager._activeTweens[TweenManager._totalActiveTweens++] = tweener;

            return tweener;
        }

        public static isTweening(target: any, propType: any): boolean {
            if (target == null)
                return false;

            var anyType: boolean = !propType;
            for (var i: number = 0; i < TweenManager._totalActiveTweens; i++) {
                var tweener: GTweener = TweenManager._activeTweens[i];
                if (tweener != null && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType))
                    return true;
            }

            return false;
        }

        public static killTweens(target: any, completed: boolean, propType: any): boolean {
            if (target == null)
                return false;

            var flag: boolean = false;
            var cnt: number = TweenManager._totalActiveTweens;
            var anyType: boolean = !propType;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = TweenManager._activeTweens[i];
                if (tweener != null && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    tweener.kill(completed);
                    flag = true;
                }
            }

            return flag;
        }

        public static getTween(target: any, propType: any): GTweener {
            if (target == null)
                return null;

            var cnt: number = TweenManager._totalActiveTweens;
            var anyType: boolean = !propType;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = TweenManager._activeTweens[i];
                if (tweener != null && tweener.target == target && !tweener._killed
                    && (anyType || tweener._propType == propType)) {
                    return tweener;
                }
            }

            return null;
        }

        public static update(): void {
            var dt: number = Laya.timer.delta / 1000;

            var cnt: number = TweenManager._totalActiveTweens;
            var freePosStart: number = -1;
            for (var i: number = 0; i < cnt; i++) {
                var tweener: GTweener = TweenManager._activeTweens[i];
                if (tweener == null) {
                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else if (tweener._killed) {
                    tweener._reset();
                    TweenManager._tweenerPool.push(tweener);
                    TweenManager._activeTweens[i] = null;

                    if (freePosStart == -1)
                        freePosStart = i;
                }
                else {
                    if ((tweener._target instanceof GObject) && (<GObject>(tweener._target)).isDisposed)
                        tweener._killed = true;
                    else if (!tweener._paused)
                        tweener._update(dt);

                    if (freePosStart != -1) {
                        TweenManager._activeTweens[freePosStart] = tweener;
                        TweenManager._activeTweens[i] = null;
                        freePosStart++;
                    }
                }
            }

            if (freePosStart >= 0) {
                if (TweenManager._totalActiveTweens != cnt) //new tweens added
                {
                    var j: number = cnt;
                    cnt = TweenManager._totalActiveTweens - cnt;
                    for (i = 0; i < cnt; i++)
                        TweenManager._activeTweens[freePosStart++] = TweenManager._activeTweens[j++];
                }
                TweenManager._totalActiveTweens = freePosStart;
            }
        }
    }

}