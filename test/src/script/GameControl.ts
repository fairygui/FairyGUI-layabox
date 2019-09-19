
import DropBox from "./DropBox";
import Bullet from "./Bullet";
/**
 * 游戏控制脚本。定义了几个dropBox，bullet，createBoxInterval等变量，能够在IDE显示及设置该变量
 * 更多类型定义，请参考官方文档
 */
export default class GameControl extends Laya.Script {
    /** @prop {name:dropBox,tips:"掉落容器预制体对象",type:Prefab}*/
    dropBox: Laya.Prefab;
    /** @prop {name:bullet,tips:"子弹预制体对象",type:Prefab}*/
    bullet: Laya.Prefab;
    /** @prop {name:createBoxInterval,tips:"间隔多少毫秒创建一个下跌的容器",type:int,default:1000}*/
    createBoxInterval: number = 1000;
    /**开始时间*/
    private _time: number = 0;
    /**是否已经开始游戏 */
    private _started: boolean = false;
    /**子弹和盒子所在的容器对象 */
    private _gameBox: Laya.Sprite;

    constructor() { super(); }

    onEnable(): void {
        this._time = Date.now();
        this._gameBox = this.owner.getChildByName("gameBox") as Laya.Sprite;
    }

    onUpdate(): void {
        //每间隔一段时间创建一个盒子
        let now = Date.now();
        if (now - this._time > this.createBoxInterval&&this._started) {
            this._time = now;
            this.createBox();
        }
    }

    createBox(): void {
        //使用对象池创建盒子
        let box: Laya.Sprite = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
        box.pos(Math.random() * (Laya.stage.width - 100), -100);
        this._gameBox.addChild(box);
    }

    onStageClick(e: Laya.Event): void {
        //停止事件冒泡，提高性能，当然也可以不要
        e.stopPropagation();
        //舞台被点击后，使用对象池创建子弹
        let flyer: Laya.Sprite = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
        flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        this._gameBox.addChild(flyer);
    }

    /**开始游戏，通过激活本脚本方式开始游戏*/
    startGame(): void {
        if (!this._started) {
            this._started = true;
            this.enabled = true;
        }
    }

    /**结束游戏，通过非激活本脚本停止游戏 */
    stopGame(): void {
        this._started = false;
        this.enabled = false;
        this.createBoxInterval = 1000;
        this._gameBox.removeChildren();
    }
}