/* global api */
class jpvi_Mazii {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        let locale = await api.locale();
        if (locale.indexOf('CN') != -1) return '剑桥英法词典';
        if (locale.indexOf('TW') != -1) return '剑桥英法词典';
        return 'mazii JP->VI Dictionary v1';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        return await this.findMazii(word);
    }

    removeTags(elem, name) {
        let tags = elem.querySelectorAll(name);
        tags.forEach(x => {
            x.outerHTML = '';
        });
    }

    removelinks(elem) {
        let tags = elem.querySelectorAll('a');
        tags.forEach(x => {
            x.outerHTML = x.innerText;
        });

        tags = elem.querySelectorAll('h2');
        tags.forEach(x => {
            x.outerHTML = `<div class='head2'>${x.innerHTML}</div>`;
        });

        tags = elem.querySelectorAll('h3');
        tags.forEach(x => {
            x.outerHTML = `<div class='head3'>${x.innerHTML}</div>`;
        });
    }

    async findMazii(word) {
        if (!word) return null;

        let base = 'https://mazii.net/search?dict=javi&type=w&query=';
        let url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
        } catch (err) {
            return null;
        }

        let contents = doc.querySelectorAll('.pr .dictionary') || [];
        if (contents.length == 0) return null;

        let definition = '';
        for (const content of contents) {
            this.removeTags(content, '.box-btn-right-df');
            this.removelinks(content);
            definition += content.innerHTML;
        }
        let css = this.renderCSS();
        return definition ? css + definition : null;
    }

    renderCSS() {
        let css = `
            <style>
            .box-main-word[_ngcontent-c18], .box-opposite-word[_ngcontent-c18] {padding-bottom: 16px;margin-bottom: 16px;min-height: 80px;}
            .main-word {font-weight: 700;font-size: 24px;float: left;margin-right: 80px;line-height: 32px;min-height: 32px;margin-bottom: 4px;}
            .phonetic-word {clear: both;font-style: normal;font-size: 16px;float: left;line-height: 32px;height: 32px;}
            .han-viet-word[_ngcontent-c18] {font-style: normal;font-size: 16px;float: left;line-height: 32px;height: 32px;}
            .mean-fr-word[_ngcontent-c18] {padding-top: 8px;font-size: 18px;clear: both;padding-bottom: 8px;}
            .example-container[_ngcontent-c19] .sentence-exam[_ngcontent-c19] {display: block;}
            .example-mean-word[_ngcontent-c19] {margin-top: 4px;}
            .content-word-example {width: -webkit-fit-content;width: -moz-fit-content;width: fit-content;position: relative;}
            .type-word[_ngcontent-c18] {clear: both;font-size: 15px;margin-top: 12px;font-weight: 200;}
            .japanese-char[_ngcontent-c19] {font-size: 18px;word-break: break-all;}
            .txt-romaji[_ngcontent-c19] {font-size: 14px;margin-right: 4px;color: gray;margin-bottom: 0;}
            .inline {display: inline-block;}
            .cl-content {color: #4f4f4f;}
            .cl-red-main {color: #e53c20;}
            .cl-blue {color: #3367d6;}
            .cl-red {color: #ff5837;}
            p {margin: 0 0 10px;}
            </style>`;

        return css;
    }
}