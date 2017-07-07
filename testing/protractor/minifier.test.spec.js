// Protractor documentation: http://www.protractortest.org/#/page-objects

var MinifierHomepage = function() {

    var This = this;
    This.longUrlTextArea  = element(by.model('miniUrlCtrl.longUrl'));
    This.longUrlSubmitBtn = element(by.id('longUrlSubmitBtn'));
    This.minifiedUrlSpan  = element(by.css('.minifiedUrlSpan'));

    This.load = function(url) {
        browser.get(url);
    };

    This.setLongUrl = function(value) {
        This.longUrlTextArea.sendKeys(value);
    };

    This.getLongUrl = function() {
        return This.longUrlTextArea.getAttribute('value');
    };

    This.submitLongUrl = function() {
        This.longUrlSubmitBtn.click();
    };

    This.clearLongUrl = function() {
        This.longUrlSubmitBtn.clear();
    };

    This.getMinifiedUrl = function() {
        return This.minifiedUrlSpan.getText();
    };
};

describe('minifier homepage', function() {

    var minifierHomepage                    = null;
    var productionMminifierWebAppUrl        = "http://1-dot-miniurl-1.appspot.com/";
    var localhostMinifierWebAppUrl          = "http://localhost:8888/";
    var validLongUrl                        = "http://www.cnn.com/";
    var inValidLongUrl                      = "http://www.cnn.com/ with spaces";
    var maliciousLongUrl                    = "http://malware.testing.google.test/testing/malware/";
    var minifierAppTitle                    = "URL Minifier";

    beforeEach(function(){
        minifierHomepage = new MinifierHomepage();
        minifierHomepage.load(localhostMinifierWebAppUrl);
    });

    it('title verified to be ' + minifierAppTitle, function() {
        expect(browser.getTitle()).toEqual(minifierAppTitle);
    });

    it('longUrlSubmitBtn is disabled when first accessed', function() {
        expect(minifierHomepage.longUrlSubmitBtn.isEnabled()).toBe(false);        
    });

    it('longUrlSubmitBtn is enabled upon valid URL entry', function() {
        minifierHomepage.setLongUrl(validLongUrl);
        expect(minifierHomepage.longUrlSubmitBtn.isEnabled()).toBe(true);        
    });

    it('longUrlSubmitBtn is disabled upon invalid URL entry', function() {
        minifierHomepage.setLongUrl(inValidLongUrl);
        expect(minifierHomepage.longUrlSubmitBtn.isEnabled()).toBe(false);        
    });

    it('exchanged a valid long URL for a minified URL successfully', function() {
        minifierHomepage.setLongUrl(validLongUrl);
        minifierHomepage.submitLongUrl();
        // TODO: Need to augment with testing for only base 32 characters in URI.
        expect(minifierHomepage.getMinifiedUrl()).toContain(localhostMinifierWebAppUrl);
    });
  
    it('launching a minified URL redirects to correct URL', function() {
        minifierHomepage.setLongUrl(productionMminifierWebAppUrl);
        minifierHomepage.submitLongUrl();
        minifierHomepage.getMinifiedUrl().then(function(minifiedUrl){
            browser.get(minifiedUrl);
            expect(browser.getTitle()).toEqual(minifierAppTitle); 
        });
    });

    it('shows no error string initially', function() {
        expect(element(by.binding('miniUrlCtrl.errorString')).isPresent()).toBe(false);
    });

    it('shows an error string when submittng a malicious URL', function() {
        minifierHomepage.setLongUrl(maliciousLongUrl);
        minifierHomepage.submitLongUrl();
        expect(element(by.binding('miniUrlCtrl.errorString')).isPresent()).toBe(true);
    });

    it('shows the correct error string when submittng a malicious URL', function() {
        minifierHomepage.setLongUrl(maliciousLongUrl);
        minifierHomepage.submitLongUrl();
        expect(element(by.binding('miniUrlCtrl.errorString')).getText()).toContain("Your url is flagged by our systems as an online threat");
    });
});