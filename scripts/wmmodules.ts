///<reference path="./ntdialog.ts" />
///<reference path="./otmword.ts" />
///<reference path="./wgenerator.ts" />

/**
 * 単語文字列作成の設定を表すインターフェース
 */
interface GeneratorSettings {
	mode: string;
	simple: SimpleWGSetting;
	simplecv: SimpleCvWGSetting;
	dependencycv: DependencyCvWGSetting;
}

/**
 * WordDisplayの持つdataのインターフェイス
 */
interface WordDisplayData {
	dictionary: OtmDictionary;
	createSetting: GeneratorSettings;
	isDisabled: boolean;
	id: number;
	equivalent: EquivalentSetting;
}

/**
 * SettingVMの持つdataのインターフェース
 */
interface SettingData {
	generatorType: [{ text: string, value: string }];
	createSetting: GeneratorSettings;
}

/**
 * EquivalentChoiceVMの持つdataのインターフェイス
 */
interface EquivalentChoiceData {
	equivalent: EquivalentSetting;
	dictionary: OtmDictionary;
	isSetEquivalentMode: boolean;
}

interface EquivalentSetting {
	translations: string[];
	selectedValue: string;
	selectedWordId: string;
}


/**
 * WordMaker for Web内で共有されるものをまとめたクラス
 */
class WMModules {
	/**
	 * 文字列作成の種類
	 */
	static GENERATOR_TYPE = [
		{ text: '単純文字列生成', value: WordGenerator.SIMPLE_SYMBOL },
		{ text: '母子音字別定義文字列生成', value: WordGenerator.SIMPLECV_SYMBOL },
		{ text: '母子音字別定義依存遷移型文字列生成', value: WordGenerator.DEPENDENCYCV_SYMBOL },
	];

	/**
	 * 文字列作成のデフォルト設定を返す
	 * @return 文字列作成のデフォルト設定
	 */
	static createSetting(): GeneratorSettings {
		return <GeneratorSettings> {
			mode: WordGenerator.SIMPLE_SYMBOL,
			simple: Object.create(WMModules.DEFAULT_SET.SIMPLE) as SimpleWGSetting,
			simplecv: Object.create(WMModules.DEFAULT_SET.SIMPLECV) as SimpleCvWGSetting,
			dependencycv: Object.create(WMModules.DEFAULT_SET.DEPENDENCYCV) as DependencyCvWGSetting,
		};
	}

	/**
	 * 訳語一覧のデフォルト値を返す
	 * @return 訳語一覧のデフォルト値
	 */
	static defaultEquivalents(): string[] {
		return Array.from(WMModules.EQUIVALENTS);
	}

	/**
	 * 指定されたデータをJSON化し，指定されたファイル名でダウンロードさせます
	 * @param data JSON化した後にダウンロードさせるファイル
	 * @param fileName ファイル名
	 */
	static exportJSON(data: any, fileName: string):void {
		let blob = new Blob([ JSON.stringify(data, undefined, 2) ], { type: "application/json" });

		if(window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(blob, fileName);
		}
		else {
			let a = document.createElement("a");
			a.download = fileName;
			
			a.href = window.URL.createObjectURL(blob);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	static equivalentDialog: NtDialog;

	/**
	 * デフォルトの文字列生成用設定
	 */
	private static DEFAULT_SET = {
		SIMPLE: {
			letters: "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s,t,u,v,w,x,y,z",
			patterns: "4,5",
			prohibitions: "bf,bp,bv,pf,pb,pv,rw",
		},
		SIMPLECV: {
			consonants: "b,c,d,f,g,h,j,k,l,m,n,p,r,s,t,v,w,x,y,z",
			vowels: "a,e,i,o,u",
			patterns: "CV*CV,CVC",
			prohibitions: "bf,bp,bv,pf,pb,pv,rw",
		},
		DEPENDENCYCV: {
			consonants: "b,c,d,f,g,h,j,k,l,m,n,p,r,s,t,v,w,x,y,z",
			vowels: "a,e,i,o,u",
			patterns: "CV*CV,CVC",
			prohibitions: "bbb,ddd,ggg,kkk,lll,mmm,nnn,ppp,rrr,ttt",
			transitions: [
				{ letter: "a", nextLetters : "b,c,d,f,g,h,i,j,k,l,m,n,p,r,s,t,u,v,w,x,y,z" },
				{ letter: "b", nextLetters : "a,b,e,i,l,o,r,u"},
				{ letter: "c", nextLetters : "a,e,i,l,o,p,r,u"},
				{ letter: "d", nextLetters : "a,d,e,i,j,o,r,u,v,z"},
				{ letter: "e", nextLetters : "b,c,d,f,g,h,i,j,k,l,m,n,p,r,s,t,v,w,x,y,z"},
				{ letter: "f", nextLetters : "a,e,i,l,o,r,u"},
				{ letter: "g", nextLetters : "a,d,e,g,i,l,m,o,r,s,u,v,z"},
				{ letter: "h", nextLetters : "a,e,i,o,u"},
				{ letter: "i", nextLetters : "b,c,d,e,f,g,h,j,k,l,m,n,o,p,r,s,t,v,w,x,y,z"},
				{ letter: "j", nextLetters : "a,d,e,i,o,u,v"},
				{ letter: "k", nextLetters : "a,e,k,i,l,m,o,r,s,t,u,v"},
				{ letter: "l", nextLetters : "a,b,d,e,f,i,j,k,l,n,o,p,s,t,u,v,z"},
				{ letter: "m", nextLetters : "a,b,e,f,i,m,o,p,u"},
				{ letter: "n", nextLetters : "a,d,e,i,n,o,s,t,u,z"},
				{ letter: "o", nextLetters : "b,c,d,f,g,h,i,j,k,l,m,n,p,r,s,t,u,v,w,x,y,z"},
				{ letter: "p", nextLetters : "a,e,i,l,o,p,r,s,t,u"},
				{ letter: "r", nextLetters : "a,b,d,e,f,g,i,k,m,o,p,r,s,t,u,v,z"},
				{ letter: "s", nextLetters : "a,d,e,i,k,l,m,n,o,p,r,t,u,v"},
				{ letter: "t", nextLetters : "a,e,i,o,r,s,t,u,v"},
				{ letter: "u", nextLetters : "b,c,d,f,g,h,i,j,k,l,m,n,o,p,r,s,t,v,w,x,y,z"},
				{ letter: "v", nextLetters : "a,d,e,i,o,r,s,u,z"},
				{ letter: "w", nextLetters : "a,e,i,o,r,u"},
				{ letter: "x", nextLetters : "a,e,i,o,u,t"},
				{ letter: "y", nextLetters : "a,e,i,m,n,o,u"},
				{ letter: "z", nextLetters : "a,d,e,i,l,m,o,r,u,v"},
			],
		},
	};

	/**
	 * 訳語一覧
	 */
	private static EQUIVALENTS = [
		"人", "男", "女",
		"家族, 親族", "親", "子供",
		"父, 父親", "母, 母親",
		"おとうさん, とうさん, おやじ, パパ", "おかあさん, かあさん, おふくろ, ママ",
		"妻", "夫",
		"兄, 弟, 兄弟", "姉, 妹, 姉妹",
		"祖父", "祖母", "おじいさん", "おばあさん",
		"孫",
		"伯父 叔父", "伯母 叔母",
		"甥", "姪",
		"いとこ 従兄弟 従姉妹 従兄 従弟 従姉 従妹",
		"生物",
		"動物",
		"哺乳類",
		"獣", "犬", "猫", "牛",
		"豚", "猪", "馬", "羊",
		"猿", "鼠", "虎", "兎",
		"鹿", "象", "ライオン, 獅子", "キリン, 麒麟",
		"竜, 龍",
		"鳥, 鳥類",
		"鶏", "雀", "カラス, 烏, 鴉",
		"雉", "鷲", "鷹",
		"爬虫類",
		"とかげ, 蜥蜴", "やもり", "蛇",
		"亀", "ワニ, 鰐",
		"両生類",
		"かえる, 蛙, おたまじゃくし", "いもり",
		"サンショウウオ, 山椒魚",
		"魚類",
		"鯛", "鰯", "鮪",
		"鰹", "秋刀魚", "鰺",
		"鯉", "鮭", "鱒",
		"金魚",
		"魚介類",
		"イカ, 烏賊", "タコ, 蛸 章魚",
		"海老, 蝦", "蟹",
		"貝", "貝殻",
		"カタツムリ, 蝸牛", "ナメクジ, 蛞蝓",
		"虫",
		"蝶, ちょうちょう", "蛾", "トンボ, 蜻蛉",
		"バッタ 飛蝗", "蜂", "蟻",
		"蛍", "蠅", "蚊",
		"ごきぶり", "クモ, 蜘蛛", "ミミズ, 蚯蚓",
		"セミ, 蝉", "カマキリ 蟷螂", "まつむし, 松虫",
		"すずむし, 鈴虫", "キリギリス", "くつわむし, 轡虫",
		"うまおいむし, 馬追虫",
		"植物",
		"草", "花", "実", "木",
		"葉, はっぱ", "根, ねっこ",
		"茎", "きのこ, 茸", "松",
		"梅", "桜", "藤",
		"あやめ, 菖蒲", "牡丹",
		"萩", "すすき, 薄, 芒",
		"菊", "もみじ, 紅葉",
		"柳", "桐", "杉", "檜",
		"竹", "蓮",
		"農作物, 作物",
		"米", "稲", "麦",
		"小麦", "大麦", "麦芽",
		"野菜",
		"果物",
		"芋",
		"豆", "大豆", "小豆",
		"大根", "人参",
		"林檎", "蜜柑", "バナナ, 甘蕉",
		"梨", "栗", "桃", "柿",
		"トマト", "キャベツ, 甘藍, 玉菜",
		"すいか, 西瓜", "ぶどう, 葡萄",
		"白菜", "椎茸", "きゅうり, 胡瓜",
		"ねぎ, 葱", "たまねぎ, 玉葱",
		"する, 為る, やる",
		"やめる",
		"いる, ある",
		"なる",
		"ない",
		"起こる, 興る",
		"生きる",
		"生む, 産む",
		"死ぬ",
		"壊れる",
		"消える",
		"隠れる",
		"現れる",
		"住む, 棲む",
		"行く",
		"来る",
		"入る",
		"出る",
		"進む",
		"戻る",
		"歩く",
		"飛ぶ",
		"走る",
		"泳ぐ",
		"送る, 贈る",
		"届く",
		"動く",
		"止まる",
		"寝る",
		"眠る",
		"起きる",
		"起こす",
		"座る",
		"立つ",
		"跳ぶ",
		"歌う",
		"踊る",
		"食べる",
		"飲む",
		"噛む, 咬む",
		"持つ",
		"取る",
		"触る",
		"押す",
		"引く",
		"回す",
		"入れる",
		"出す",
		"投げる",
		"外す",
		"当てる",
		"掴む",
		"放す, 離す",
		"打つ",
		"叩く",
		"殴る",
		"落とす",
		"掛ける",
		"欠ける",
		"指す, 差す",
		"刺す",
		"蹴る",
		"乗る",
		"動かす",
		"止める",
		"跳ねる, 撥ねる",
		"壊す",
		"作る",
		"消す",
		"失くす",
		"拾う",
		"折る",
		"曲げる",
		"切る",
		"千切る",
		"契る",
		"刻む",
		"付ける",
		"繋ぐ, つなぐ",
		"繋げる, つなげる",
		"混ぜる, 交ぜる",
		"分ける",
		"冷やす",
		"温める",
		"固める",
		"溶かす",
		"塗る",
		"乾かす",
		"向ける",
		"増やす",
		"減らす",
		"始める",
		"終える",
		"急ぐ",
		"守る",
		"埋める",
		"奉る",
		"妨げる",
		"培う",
		"宿す",
		"空く",
		"混む",
		"要る",
		"乾く",
		"乱す",
		"乱れる",
		"仕える",
		"備わる",
		"優れる",
		"冷える",
		"冷める",
		"覚める",
		"向く",
		"倒れる",
		"固まる",
		"埋まる",
		"埋もれる",
		"増す, 増える",
		"外れる",
		"太る",
		"始まる",
		"終わる",
		"決める",
		"宿る",
		"見る",
		"聴く, 聞く",
		"触る",
		"嗅ぐ",
		"味わう",
		"舐める",
		"香る",
		"言う",
		"話す",
		"書く",
		"読む",
		"聞く",
		"答える",
		"頼む",
		"伝える",
		"訴える",
		"告げる",
		"唆す",
		"喋る",
		"申す",
		"使う",
		"作る, 造る, 創る",
		"直す, 治す",
		"捨てる",
		"取る, 採る",
		"置く",
		"余る",
		"残す",
		"済む",
		"知る",
		"考える",
		"覚える",
		"忘れる",
		"思う",
		"感じる",
		"悲しむ, 哀しむ",
		"泣く",
		"笑う",
		"怒る",
		"褒める",
		"喜ぶ",
		"慰める",
		"飽きる",
		"驚く",
		"会う",
		"合う",
		"開ける",
		"空ける",
		"遊ぶ",
		"与える",
		"集まる",
		"植える",
		"飢える",
		"帰る",
		"返る",
		"変える, 代える",
		"孵る",
		"隠す",
		"着る",
		"脱ぐ",
		"閉める, 締める",
		"絞める",
		"占める",
		"疲れる",
		"出かける",
		"働く",
		"休む",
		"待つ",
		"分かれる",
		"別れる",
		"買う",
		"飼う",
		"売る",
		"貸す",
		"借りる",
		"もらう",
		"盗む",
		"商う",
		"争う",
		"備える",
		"伸ばす",
		"促す",
		"率いる",
		"犯す",
		"侵す",
		"冒す",
		"倒す",
		"定める",
		"良い, 善い",
		"悪い",
		"高い",
		"低い",
		"安い",
		"大きい",
		"小さい",
		"細い",
		"太い",
		"古い",
		"新しい",
		"若い",
		"軽い",
		"重い",
		"易しい",
		"難しい",
		"柔らかい, 軟らかい",
		"硬い, 堅い, 固い",
		"熱い, 暑い",
		"冷たい",
		"寒い",
		"厚い",
		"薄い",
		"上手い, 巧い",
		"美味い, 旨い",
		"不味い",
		"甘い",
		"辛い",
		"塩辛い",
		"苦い",
		"久しい",
		"乏しい, 欠しい",
		"卑しい",
		"恭しい",
		"忙しい",
		"怪しい, 妖しい",
		"惜しい",
		"慌ただしい, 遽しい",
		"正しい",
		"汚い",
		"涼しい",
		"激しい",
		"珍しい",
		"等しい",
		"紛らわしい",
		"美しい",
		"芳しい",
		"著しい",
		"親しい",
		"詳しい",
		"貧しい",
		"険しい",
		"頼もしい",
		"麗しい",
		"丸い, 円い",
		"無い, 亡い",
		"偉い, 豪い",
		"幼い",
		"多い",
		"尊い",
		"広い",
		"弱い",
		"強い",
		"憂い",
		"早い, 速い",
		"暗い",
		"長い, 永い",
		"浅い",
		"渋い",
		"深い",
		"清い",
		"淡い",
		"潔い",
		"濃い",
		"煙い",
		"狭い",
		"白い",
		"短い",
		"荒い",
		"細かい",
		"緩い",
		"賢い",
		"赤い",
		"近い",
		"遅い",
		"遠い",
		"酸い",
		"鈍い",
		"鋭い",
		"青い",
		"醜い",
		"黒い",
		"浅ましい",
		"とんでもない",
		"有り難い",
		"勇ましい",
		"嬉しい",
		"悲しい",
		"寂しい, 淋しい",
		"怖い, 恐い",
		"痛い",
		"痒い",
		"臭い",
		"辛い",
		"嘆かわしい",
		"優しい",
		"厳しい",
		"忌まわしい)",
		"恐ろしい, 怖ろしい",
		"恥ずかしい)",
		"恋しい",
		"悔しい",
		"恨めしい",
		"憎らしい",
		"懐かしい",
		"楽しい, 愉しい",
		"欲しい",
		"汚らわしい",
		"狂おしい",
		"甚だしい",
		"苦しい",
		"快い",
		"憎い, 悪い",
		"疎い",
		"眠い",
		"痛ましい",
		"疎ましい",
		"体",
		"足, 脚", "踵", "脛", "腿",
		"頭", "顔", "口", "唇",
		"歯", "鼻", "髭", "眉, 眉毛",
		"頬, ほっぺ", "舌", "髪",
		"耳", "目", "腕", "肩",
		"爪", "手", "手首", "手の平, 掌",
		"指", "尻", "おなか, 腹", "首",
		"背中", "腰", "胸", "肌, 皮膚",
		"毛", "筋肉", "血", "骨", "心",
		"内臓", "食道", "胃",
		"腸", "十二指腸", "小腸",
		"盲腸", "大腸", "直腸",
		"心臓", "肝臓", "肺, 肺臓",
		"脾臓", "腎臓", "膵臓",
		"胆嚢", "膀胱",
	];

}

