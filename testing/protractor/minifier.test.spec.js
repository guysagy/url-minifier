// Protractor documentation: http://www.protractortest.org/#/page-objects

var MinifierHomepage = function() {

    var longUrlTextArea = element(by.model('miniUrlCtrl.longUrl'));

    this.load = function(url) {
        browser.get(url);
    };

    this.setLongUrl = function(value) {
        longUrlTextArea.sendKeys(value);
    };
  
    this.getLongUrl = function() {
        return longUrlTextArea.getAttribute('value');
    };
};

describe('minifier homepage', function() {
    
    var minifierHomepage = null;
    
    beforeEach(function(){
        minifierHomepage = new MinifierHomepage();
        var minifierUrl = 'http://1-dot-miniurl-1.appspot.com/';
        minifierHomepage.load(minifierUrl);
    });

    it('set long url', function() {
        var longUrl = "http://www.cnn.com/";
        minifierHomepage.setLongUrl(longUrl);
        expect(minifierHomepage.getLongUrl()).toEqual(longUrl);
    });    
});
