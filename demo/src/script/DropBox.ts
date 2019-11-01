import GameUI from "./GameUI";
/**
 * 掉落盒子脚本，实现盒子碰撞及回收流程
 */
export default class DropBox extends Laya.Script {
    /**盒子等级 */
    level: number = 1;
    /**等级文本对象引用 */
    private _text: Laya.Text;
    /**刚体对象引用 */
    private _rig: Laya.RigidBody

    constructor() { super(); }
    onEnable(): void {
        /**获得组件引用，避免每次获取组件带来不必要的查询开销 */
        this._rig = this.owner.getComponent(Laya.RigidBody);
        this.level = Math.round(Math.random() * 5) + 1;
        this._text = this.owner.getChildByName("levelTxt") as Laya.Text;
        this._text.text = this.level + "";
    }

    onUpdate(): void {
        //让持续盒子旋转
        (this.owner as Laya.Sprite).rotation++;
    }

    onTriggerEnter(other: any, self: any, contact: any): void {
        var owner: Laya.Sprite = this.owner as Laya.Sprite;
        if (other.label === "buttle") {
            //碰撞到子弹后，增加积分，播放声音特效
            if (this.level > 1) {
                this.level--;
                this._text.changeText(this.level + "");
                owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                Laya.SoundManager.playSound("sound/hit.wav");
            } else {
                if (owner.parent) {
                    let effect: Laya.Animation = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                    effect.pos(owner.x, owner.y);
                    owner.parent.addChild(effect);
                    effect.play(0, true);
                    owner.removeSelf();
                    Laya.SoundManager.playSound("sound/destroy.wav");
                }
            }
            GameUI.instance.addScore(1);
        } else if (other.label === "ground") {
            //只要有一个盒子碰到地板，则停止游戏
            owner.removeSelf();
            GameUI.instance.stopGame();
        }
    }

    /**使用对象池创建爆炸动画 */
    createEffect(): Laya.Animation {
        let ani: Laya.Animation = new Laya.Animation();
        ani.loadAnimation("test/TestAni.ani");
        ani.on(Laya.Event.COMPLETE, null, recover);
        function recover(): void {
            ani.removeSelf();
            Laya.Pool.recover("effect", ani);
        }
        return ani;
    }

    onDisable(): void {
        //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("dropBox", this.owner);
    }
}