///<reference path="./otmword.ts" />
///<reference path="./wmmodules.ts" />
///<reference path="./wgenerator.ts" />
///<reference path="./ntdialog.ts" />

class EquivalentChoiceVM {
	el: string;
	data: EquivalentChoiceData;
	methods: {[key: string]: any};

	/**
	 * コンストラクタ
	 * @param el バインディングを適用するタグのid
	 * @param dict OTM形式辞書クラス
	 */
	constructor(el: string, dict: OtmDictionary, equivalent: EquivalentSetting) {
		this.el = el;
		this.data = <EquivalentChoiceData> {
			equivalent: equivalent,
			dictionary: dict,
			isSetEquivalentMode: false,
		};

		WMModules.equivalentDialog.onshow = () => {
			this.data.isSetEquivalentMode = (this.data.equivalent.selectedWordId === "");
		}

		WMModules.equivalentDialog.onhide = () => {
			this.data.equivalent.selectedValue = "";
			this.data.equivalent.selectedWordId = "";
		}

		this.initMethods();
	}

	/**
	 * VMで使用するメソッドを定義するメソッド
	 */
	private initMethods(): void {
		this.methods = {

			/**
			 * ダイアログで訳語を追加するためのメソッド
			 */
			setTranslations: function _setTranslations(ev): void {
				let files = ev.target.files;

				for(let i = 0; i < files.length; i++){
					let reader = new FileReader();
					reader.readAsText(files[i]);
					
					this.equivalent.translations.splice(0);
					reader.onload = () => {
						let result = reader.result;

						let lines = result.replace('\r\n', '\n').replace('\r', '\n')
							.split('\n').filter(function(el) {
								return el !== "";
						});

						for(let i = 0; i < lines.length; i++) {
							this.equivalent.translations.push(lines[i]);
						}
					};
				}
			},

			/**
			 * ダイアログで決定ボタンを押した場合の処理を行うメソッド
			 */
			addTranslation: function _addTranslation(): void {
				if(this.equivalent.selectedValue !== "") {
					let id = Number(this.equivalent.selectedWordId);
					let word = this.dictionary.getWord(id);

					word.insert(0, this.equivalent.selectedValue);
				}
			},

			/**
			 * ダイアログでキャンセルボタンを押した場合の処理を行うメソッド
			 */
			cancel: function _cancel(): void {
				WMModules.equivalentDialog.hide();
			},
		};
	}
}
