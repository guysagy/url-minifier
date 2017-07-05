// Protractor documentation: http://www.protractortest.org/#/page-objects

var MinifierHomepage = function() {

    var longUrlTextArea = element(by.model('miniUrlCtrl.longUrl'));
    var longUrlSubmitBtn = element(by.id('longUrlSubmitBtn'));
    var minifiedUrlSpan = element(by.css('.minifiedUrlSpan'));

    this.load = function(url) {
        browser.get(url);
    };

    this.setLongUrl = function(value) {
        longUrlTextArea.sendKeys(value);
    };

    this.getLongUrl = function() {
        return longUrlTextArea.getAttribute('value');
    };

    this.submitLongUrl = function() {
        longUrlSubmitBtn.click();
    };

    this.getMinifiedUrl = function() {
        return minifiedUrlSpan.getText();
    };
};

describe('minifier homepage', function() {

    var minifierHomepage = null;
    //var minifierWebAppUrl = 'http://1-dot-miniurl-1.appspot.com/';
    var minifierWebAppUrl = 'http://localhost:8888/';
    var longUrl = "http://www.cnn.com/";

    beforeEach(function(){
        minifierHomepage = new MinifierHomepage();
        minifierHomepage.load(minifierWebAppUrl);
    });

    it('set long url correctly', function() {
        minifierHomepage.setLongUrl(longUrl);
        expect(minifierHomepage.getLongUrl()).toEqual(longUrl);
    });

    it('got correct minified url', function() {
        minifierHomepage.setLongUrl(longUrl);
        minifierHomepage.submitLongUrl();
        expect(minifierHomepage.getMinifiedUrl()).toContain(minifierWebAppUrl);
    });

});
