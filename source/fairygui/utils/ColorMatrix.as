package fairygui.utils
{
	public dynamic class ColorMatrix extends Array {
		
		// identity matrix constant:
		private static const IDENTITY_MATRIX:Array = [
			1,0,0,0,0,
			0,1,0,0,0,
			0,0,1,0,0,
			0,0,0,1,0
		];
		private static const LENGTH:Number = IDENTITY_MATRIX.length;
		
		private static const LUMA_R:Number = 0.299;
		private static const LUMA_G:Number = 0.587;
		private static const LUMA_B:Number = 0.114;
		
		public static function create(p_brightness:Number,p_contrast:Number,p_saturation:Number,p_hue:Number):ColorMatrix {
			var ret:ColorMatrix = new ColorMatrix();
			ret.adjustColor(p_brightness, p_contrast, p_saturation, p_hue);
			return ret;
		}
		
		// initialization:
		public function ColorMatrix() {
			reset();
		}
		
		
		// public methods:
		public function reset():void {
			for (var i:uint=0; i<LENGTH; i++) {
				this[i] = IDENTITY_MATRIX[i];
			}
		}
		
		public function invert():void
		{
			multiplyMatrix([-1,  0,  0,  0, 255,
				0, -1,  0,  0, 255,
				0,  0, -1,  0, 255,
				0,  0,  0,  1,   0]);
		}
		
		public function adjustColor(p_brightness:Number,p_contrast:Number,p_saturation:Number,p_hue:Number):void {
			adjustHue(p_hue);
			adjustContrast(p_contrast);
			adjustBrightness(p_brightness);
			adjustSaturation(p_saturation);
		}
		
		public function adjustBrightness(p_val:Number):void {
			p_val = cleanValue(p_val,1)*255;
			multiplyMatrix([
				1,0,0,0,p_val,
				0,1,0,0,p_val,
				0,0,1,0,p_val,
				0,0,0,1,0
			]);
		}
		
		public function adjustContrast(p_val:Number):void {
			p_val = cleanValue(p_val,1);
			var s:Number = p_val + 1;
			var o:Number = 128 * (1 - s);
			multiplyMatrix([
				s,0,0,0,o,
				0,s,0,0,o,
				0,0,s,0,o,
				0,0,0,1,0
			]);
		}
		
		public function adjustSaturation(p_val:Number):void {
			p_val = cleanValue(p_val,1);
			p_val += 1;
			
			var invSat:Number  = 1 - p_val;
			var invLumR:Number = invSat * LUMA_R;
			var invLumG:Number = invSat * LUMA_G;
			var invLumB:Number = invSat * LUMA_B;
			
			multiplyMatrix([
				(invLumR + p_val), invLumG,  invLumB, 0, 0,
				invLumR, (invLumG + p_val), invLumB, 0, 0,
				invLumR, invLumG, (invLumB + p_val), 0, 0,
				0, 0, 0, 1, 0
			]);
		}
		
		public function adjustHue(p_val:Number):void {
			p_val = cleanValue(p_val,1);
			p_val *= Math.PI;
			
			var cos:Number = Math.cos(p_val);
			var sin:Number = Math.sin(p_val);
			
			multiplyMatrix([
				((LUMA_R + (cos * (1 - LUMA_R))) + (sin * -(LUMA_R))), ((LUMA_G + (cos * -(LUMA_G))) + (sin * -(LUMA_G))), ((LUMA_B + (cos * -(LUMA_B))) + (sin * (1 - LUMA_B))), 0, 0,
				((LUMA_R + (cos * -(LUMA_R))) + (sin * 0.143)), ((LUMA_G + (cos * (1 - LUMA_G))) + (sin * 0.14)), ((LUMA_B + (cos * -(LUMA_B))) + (sin * -0.283)), 0, 0,
				((LUMA_R + (cos * -(LUMA_R))) + (sin * -((1 - LUMA_R)))), ((LUMA_G + (cos * -(LUMA_G))) + (sin * LUMA_G)), ((LUMA_B + (cos * (1 - LUMA_B))) + (sin * LUMA_B)), 0, 0,
				0, 0, 0, 1, 0
			]);
		}
		
		public function concat(p_matrix:Array):void {
			if (p_matrix.length != LENGTH) { return; }
			multiplyMatrix(p_matrix);
		}
		
		public function clone():ColorMatrix {
			var result:ColorMatrix = new ColorMatrix();
			result.copyMatrix(this);
			return result;
		}
		
		protected function copyMatrix(p_matrix:Array):void {
			var l:Number = LENGTH;
			for (var i:uint=0;i<l;i++) {
				this[i] = p_matrix[i];
			}
		}
		
		protected function multiplyMatrix(p_matrix:Array):void {
			var col:Array = [];
			
			var i:int = 0;
			
			for (var y:int=0; y<4; ++y)
			{
				for (var x:int=0; x<5; ++x)
				{
					col[i+x] = p_matrix[i    ] * this[x     ] +
						p_matrix[i + 1] * this[x +  5] +
						p_matrix[i + 2] * this[x + 10] +
						p_matrix[i + 3] * this[x + 15] +
						(x == 4 ? p_matrix[i + 4] : 0);
				}
				
				i += 5;
			}
			
			copyMatrix(col);
		}
		
		protected function cleanValue(p_val:Number,p_limit:Number):Number {
			return Math.min(p_limit,Math.max(-p_limit,p_val));
		}
	}
}
