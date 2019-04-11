var dictItems = function (Ogg) {
    // ottieni valori dell'oggetto (dizionario)
    var els = [];
    for (var k in Ogg) {
        if (Ogg.hasOwnProperty(k)) {
            els.push(Ogg[k]);
        }
    };
    return els;
};
var arrSum = function (arr) {
    // somma elementi di un Array numerico
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return arr.reduce(reducer);
};
////

var isWikipediaURL = function (record) {
    // Verifica se un link appartiene a Commons
    return record.indexOf('wikipedia.org') > -1;
};
var getWikipediaLang = function (record) {
    return record.split('://')[1].split('.')[0];
};
var getWikipediaPageName = function (record) {
    try {
        els = record.split('/wiki/');
        return decodeURI(els[els.length - 1].replace(/[_]/g, " "));
    }
    catch (err) {
        return 'Wikipedia article';
    }
};

var openModal = function (ev) {
    if (window.isMobile != 'undefined') {
        if (window.isMobile()) {
            openModalOnMobile(ev);
        }
    }
};

var openModalOnMobile = function (ev) {
    let popp = ev.sourceTarget.getPopup();
    let html_content = popp.getContent();
    // chiudo il baloon per il mobile
    ev.sourceTarget.closePopup();
    // Popup per mobile
    $('#pagepop .content').html(html_content);
    $('#pagepop').dimmer('show');
    // Show close button
    $('#pagepopclose').toggleClass('hidden');
};

var wikidataImageUrl2proxyPath = function (kwargs) {
    parser = document.createElement('a');
    parser.href = kwargs['url'];
    var prefix2replace = '/wiki/Special:FilePath/';
    var localThumbPrefix = '/thumb/';
    // Elabora path locale thumb
    return parser.pathname.replace(prefix2replace, localThumbPrefix);;
};

var prettify = function(text, color, totcounter) {
    // input: text
    // output: html
    // Label degli pseudolivelli da visualizzare
    var layersLabelsPattern = '<span class="legenda-label" style="background-color: {{bg}};">{{text}} ({{count}})</span>';
    var count = 0;
    return layersLabelsPattern.replace(/{{bg}}/g, color)
                              .replace(/{{text}}/g, text)
                              .replace(/{{count}}/g, count.toString())
                              // totcounter
};

var getUrlParameter = function getUrlParameter (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
