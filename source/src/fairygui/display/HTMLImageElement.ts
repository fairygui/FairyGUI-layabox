namespace fgui {
    import Texture = Laya.Texture;
    import HTMLImageElement = Laya.HTMLImageElement;
    const proto: HTMLImageElement = HTMLImageElement.prototype;
    const reset: Function = proto.reset;
    const src: Function = Object.getOwnPropertyDescriptor(proto, 'src').set;

    Object.defineProperties(proto, {
        // @Overwrite
        reset: {
            // Call in constructor and destroy
            value(): HTMLImageElement {
                return reset.call(this._stop()._resetAni());
            }
        },
        _resetAni: {
            value(): HTMLImageElement {
                this._tex = null;
                this._frame = 0;
                this._reversed = false;
                this._pi = null;
                return this;
            }
        },
        _stop: {
            value(): HTMLImageElement {
                Laya.timer.clear(this, this._drawImage);
                return this;
            }
        },
        _drawImage: {
            value(graphic: Laya.Graphics, gX: number, gY: number): void {
                let tex = this._tex;
                if (!tex || !tex.getIsReady()) return;
                const width: number = this.width || tex.width;
                const height: number = this.height || tex.height;
                const pi: PackageItem = this._pi;
                if (pi) {
                    const frames = pi.load() as Frame[];
                    const curFrame: Frame = frames[this._frame];
                    let delay: number = pi.interval + curFrame.addDelay;
                    if (pi.swing) {
                        if (!this._reversed) {
                            if (this._frame === frames.length - 1) {
                                this._reversed = true;
                                this._frame--;
                                delay += pi.repeatDelay;
                            } else {
                                this._frame++;
                            }
                        } else {
                            if (this._frame === 0) {
                                this._reversed = false;
                                this._frame++;
                                delay += pi.repeatDelay;
                            } else {
                                this._frame--;
                            }
                        }
                    } else {
                        if (this._frame === frames.length - 1) {
                            // this._reversed = true;
                            this._frame = 0;
                            delay += pi.repeatDelay;
                        } else {
                            this._frame++;
                        }
                    }
                    this._tex = frames[this._frame].texture;// Next frame
                    Laya.timer.once(delay, this, this._drawImage, [graphic, gX, gY]);
                }
                graphic.drawImage(tex, gX, gY, width, height);
            }
        },
        // @Overwrite
        renderSelfToGraphic: {
            value(graphic: Laya.Graphics, gX: number, gY: number): void {
                this._stop()._drawImage(graphic, gX, gY);
            }
        },
        // @Overwrite
        src: {
            set(url: string) {
                if (ToolSet.startsWith(url, "ui://")) {
                    if (this._url === url) return;
                    this._stop()._resetAni();
                    const pi: PackageItem = UIPackage.getItemByURL(url);
                    let tex: Texture = null;
                    // Asset must be preloaded
                    if (pi) {
                        const asset: Object = pi.load();
                        if (asset instanceof Texture) {
                            tex = asset;
                        } else if (pi.type === PackageItemType.MovieClip && Array.isArray(asset) && asset.length > 0) {
                            // Assuming that each texture is the same size, just layout once
                            tex = asset[0].texture;
                            if (asset.length > 1) this._pi = pi;
                        }
                        this._tex = tex;
                        tex && this.onloaded();
                    }
                } else {
                    // Dynamic loading asset
                    src.call(this, url);
                }
            }
        }
    });
}
