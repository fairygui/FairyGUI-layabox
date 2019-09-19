namespace fgui {
    export class GProgressBar extends GComponent {
        private _max: number = 0;
        private _value: number = 0;
        private _titleType: number;
        private _reverse: boolean;

        private _titleObject: GObject;
        private _aniObject: GObject;
        private _barObjectH: GObject;
        private _barObjectV: GObject;
        private _barMaxWidth: number = 0;
        private _barMaxHeight: number = 0;
        private _barMaxWidthDelta: number = 0;
        private _barMaxHeightDelta: number = 0;
        private _barStartX: number = 0;
        private _barStartY: number = 0;

        constructor() {
            super();

            this._titleType = ProgressTitleType.Percent;
            this._value = 50;
            this._max = 100;
        }

        /**
         * @see ProgressTitleType
         */
        public get titleType(): number {
            return this._titleType;
        }

        /**
         * @see ProgressTitleType
         */
        public set titleType(value: number) {
            if (this._titleType != value) {
                this._titleType = value;
                this.update(value);
            }
        }

        public get max(): number {
            return this._max;
        }

        public set max(value: number) {
            if (this._max != value) {
                this._max = value;
                this.update(value);
            }
        }

        public get value(): number {
            return this._value;
        }

        public set value(value: number) {

            if (this._value != value) {
                GTween.kill(this, false, this.update);

                this._value = value;
                this.update(value);
            }
        }

        public tweenValue(value: number, duration: number): GTweener {
            var oldValule: number;

            var tweener: GTweener = GTween.getTween(this, this.update);
            if (tweener != null) {
                oldValule = tweener.value.x;
                tweener.kill();
            }
            else
                oldValule = this._value;

            this._value = value;
            return GTween.to(oldValule, this._value, duration).setTarget(this, this.update).setEase(EaseType.Linear);
        }

        public update(newValue: number): void {
            var percent: number = this._max != 0 ? Math.min(newValue / this._max, 1) : 0;
            if (this._titleObject) {
                switch (this._titleType) {
                    case ProgressTitleType.Percent:
                        this._titleObject.text = Math.round(percent * 100) + "%";
                        break;

                    case ProgressTitleType.ValueAndMax:
                        this._titleObject.text = Math.round(newValue) + "/" + Math.round(this._max);
                        break;

                    case ProgressTitleType.Value:
                        this._titleObject.text = "" + Math.round(newValue);
                        break;

                    case ProgressTitleType.Max:
                        this._titleObject.text = "" + Math.round(this._max);
                        break;
                }
            }

            var fullWidth: number = this.width - this._barMaxWidthDelta;
            var fullHeight: number = this.height - this._barMaxHeightDelta;
            if (!this._reverse) {
                if (this._barObjectH) {
                    if ((this._barObjectH instanceof GImage) && (<GImage>this._barObjectH).fillMethod != FillMethod.None)
                        (<GImage>this._barObjectH).fillAmount = percent;
                    else
                        this._barObjectH.width = Math.round(fullWidth * percent);
                }
                if (this._barObjectV) {
                    if ((this._barObjectV instanceof GImage) && (<GImage>this._barObjectV).fillMethod != FillMethod.None)
                        (<GImage>this._barObjectV).fillAmount = percent;
                    else
                        this._barObjectV.height = Math.round(fullHeight * percent);
                }
            }
            else {
                if (this._barObjectH) {
                    if ((this._barObjectH instanceof GImage) && (<GImage>this._barObjectH).fillMethod != FillMethod.None)
                        (<GImage>this._barObjectH).fillAmount = 1 - percent;
                    else {
                        this._barObjectH.width = Math.round(fullWidth * percent);
                        this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                    }

                }
                if (this._barObjectV) {
                    if ((this._barObjectV instanceof GImage) && (<GImage>this._barObjectV).fillMethod != FillMethod.None)
                        (<GImage>this._barObjectV).fillAmount = 1 - percent;
                    else {
                        this._barObjectV.height = Math.round(fullHeight * percent);
                        this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                    }
                }
            }
            if (this._aniObject instanceof GMovieClip)
                (<GMovieClip>this._aniObject).frame = Math.round(percent * 100);
        }

        protected constructExtension(buffer: ByteBuffer): void {
            buffer.seek(0, 6);

            this._titleType = buffer.readByte();
            this._reverse = buffer.readBool();

            this._titleObject = this.getChild("title");
            this._barObjectH = this.getChild("bar");
            this._barObjectV = this.getChild("bar_v");
            this._aniObject = this.getChild("ani");

            if (this._barObjectH) {
                this._barMaxWidth = this._barObjectH.width;
                this._barMaxWidthDelta = this.width - this._barMaxWidth;
                this._barStartX = this._barObjectH.x;
            }
            if (this._barObjectV) {
                this._barMaxHeight = this._barObjectV.height;
                this._barMaxHeightDelta = this.height - this._barMaxHeight;
                this._barStartY = this._barObjectV.y;
            }
        }

        protected handleSizeChanged(): void {
            super.handleSizeChanged();

            if (this._barObjectH)
                this._barMaxWidth = this.width - this._barMaxWidthDelta;
            if (this._barObjectV)
                this._barMaxHeight = this.height - this._barMaxHeightDelta;
            if (!this._underConstruct)
                this.update(this._value);
        }

        public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
            super.setup_afterAdd(buffer, beginPos);

            if (!buffer.seek(beginPos, 6)) {
                this.update(this._value);
                return;
            }

            if (buffer.readByte() != this.packageItem.objectType) {
                this.update(this._value);
                return;
            }

            this._value = buffer.getInt32();
            this._max = buffer.getInt32();

            this.update(this._value);
        }
    }
}