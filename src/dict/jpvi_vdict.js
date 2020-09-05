/* global api */
class jpvi_Jdict {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        return 'jpvi Jdict Dictionary';
    }


    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        let results = await this.findVdict(word);
        return results;
    }

    removeTags(elem, name) {
        let tags = elem.querySelectorAll(name);
        tags.forEach(x => {
            x.outerHTML = '';
        });
    }

    getKanji(jsonData) {
        let html = '<div id="kanji" class="ui segment active tab panel-content"><div class="word_kanji_list">';
        for (const iterator of jsonData) {
            html += `
                <div class="kanji_item">
                    <div class="kanji_item__letter japanese-font">${iterator.kanji}</div>
                    <div class="kanji_item__description">
                        <div class="kanji_item__hanviet">${iterator.hanviet}</div>
                        <div class="kanji_item__pronunciation japanese-font">
                            <div class="kanji_item__pronunciation__onyomi"><span>On:</span>${iterator.onyomi}</div>
                            <div class="kanji_item__pronunciation__kunyomi"><span>Kun:</span>${iterator.kunyomi}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += "</div></div>";
        return html;
    }

    getExample(examples) {
        let html = '<p class="mean-fr-word line_break"></p>';
        let total = examples.length > 3 ? 3 : examples.length;
        for (let index = 0; index < total; index++) {
            const element = examples[index];
            html += `
                <div class="mean-fr-word cl-blue">
                    <span class="japanese-char inline">${element.content}</span>
                    <p class="example-mean-word sentence-exam cl-content">${element.mean}</p>
                </div>
            `;
        }
        return html;
    }

    async findVdict(word) {
        let notes = [];
        if (!word) return notes; // return empty notes

        let baseSlug = "https://jdict.net/api/v1/search?keyword=" + encodeURIComponent(word) +
            "&keyword_position=start&page=1&type=word";
        let dataSlug = await fetch(baseSlug);
        let jsonSlug = await dataSlug.json();
        let keyword = jsonSlug.list[0].slug;

        let base = "https://jdict.net/api/v1/words/";
        let url = base + encodeURIComponent(keyword) + "?get_relate=1"

        let doc = '';
        try {
            let response = await fetch(url);
            let jsonData = await response.json();

            let kanjiHtml = this.getKanji(jsonData.kanjis);
            let exampleHtml = this.getExample(jsonData.examples);

            let htmlData = `
            <div class="box-main-word">
                <p>
                    <span class="main-word cl-red-main">${jsonData.word}</span>
                    <span class="mean-fr-word romaji">${jsonData.kana}</span>
                    <span class="mean-fr-word cl-blue">◆ ${jsonData.suggest_mean}</span>
                </p>
        `;
            htmlData += kanjiHtml + exampleHtml + '</div>';

            let parser = new DOMParser();
            doc = parser.parseFromString(htmlData, 'text/html');
        } catch (err) {
            return [];
        }

        let jbjs = doc.querySelector('.box-main-word') || '';
        let definition = '';
        if (jbjs) {
            definition += jbjs.innerHTML;
            let css = this.renderCSS();
            return definition ? css + definition : definition;

        } else {
            return [];
        }

    }

    renderCSS() {
        let css = `
            <style>
                .main-word {font-weight: 700;font-size: 24px;margin-right: 80px;line-height: 32px;min-height: 32px;margin-bottom: 4px;}
                .mean-fr-word {font-size: 18px;clear: both;}
                .example-container .sentence-exam {display: block;}
                .example-mean-word {margin-top: 4px;}
                .japanese-char {font-size: 15px;word-break: break-all;}
                .inline {display: inline-block;}
                .cl-content {color: #4f4f4f;}
                .cl-red-main {color: #e53c20;}
                .cl-blue {color: #3367d6;}
                .cl-red {color: #ff5837;}
                p {margin: 0 0 5px;}
                .line_break {margin-bottom: 20px;}
                .romaji {color: #888;display: block;}
                .kanji_item {margin-right: 20px;display: flex;align-items: center;background: #f1f3f4;border-radius: 7px;}
                .kanji_item__letter {font-size: 30px;color: #3b3b3b;line-height: 40px;}
                .japanese-font {font-family: Noto Sans JP, sans-serif !important;}
                .kanji_item__hanviet {font-size: 15px;line-height: 15px;}
                .kanji_item__pronunciation {display: flex;}
                .kanji_item__pronunciation__onyomi {font-size: 14px;}
                .kanji_item__pronunciation__kunyomi {font-size: 14px;margin-left: 10px;}
                .ui.tab.active, .ui.tab.open {display: block;}
            </style>`;

        return css;
    }
}