const webdriver = require('selenium-webdriver');
const { Options: FirefoxOptions } = require('selenium-webdriver/firefox');
const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const Promise = require('bluebird');
const config = require('../../config');

class SeleniumDeliveryMedium {

    /**
     * Instantiates a SeleniumDelieveryMedium object according to the specified config.
     * The pagination types supported are currently URL-based and next-button based.
     * The firefox browserType is currently only fully tested and supported.
     * 
     * @param {Object} deliveryMediumConfig 
     */
    constructor(deliveryMediumConfig) {
        // class constants
        this.FIREFOX = 'firefox';
        this.CHROME = 'chrome';
        this.dataPath = config.appStoragePath;
        this.dataCache = [];
        this.indexPagesProcessed = 0;

        // parameterized values
        this.browserType = deliveryMediumConfig.browserType;
        this.behaviouralMimics = deliveryMediumConfig.behaviouralMimics;
        this.requestOptions = deliveryMediumConfig.requestOptions;
        this.paginationType = deliveryMediumConfig.paginationType;
        this.paginationUrlTemplate = deliveryMediumConfig.paginationUrlTemplate;
        this.browserOptions = deliveryMediumConfig.browserOptions;
        this.flushAfter = deliveryMediumConfig.flushAfter;
        this.consumerFunction = deliveryMediumConfig.consumerFunction || function (html) { return html };
        this.browser = null;
        this.initializeBrowser();
    }

    destroy() {
        if (this.browser !== null) {
            this.browser.close();
        }
    }
    
    getOptions() {
        let options = null;
        switch (this.browserType) {    
            case this.FIREFOX:
                options = new FirefoxOptions();
                break;
            case this.CHROME:
                options = new ChromeOptions();
                break;
        }
        
        if (this.browserOptions.headless === true) {
            options.headless();
        }
        
        return options;
    }

    setDataPath(dataPath) {
        this.dataPath = dataPath;
    }

    setBrowserOptions(options, builder) {
        switch (this.browserType) {
            case this.FIREFOX:
                builder.setFirefoxOptions(options);
                break;
            case this.CHROME:
                builder.setChromeOptions(options);
                break;
        }
    }

    initializeBrowser() {
        const options = this.getOptions();
        const builder = new webdriver.Builder().forBrowser(this.browserType);
        this.setBrowserOptions(options, builder);
        this.browser = builder.build();
    }

    findElement(value, type) {
        switch (type) {
            case 'class':
                return this.browser.findElement(By.className(value));
            case 'id':
                return this.browser.findElement(By.id(value));
            case 'css':
                return this.browser.findElement(By.css(value));
            case 'xpath':
                return this.browser.findElement(By.xpath(value));
            case 'name':
                return this.browser.findElement(By.name(value));
        }
    }

    findElements(value, type) {
        switch (type) {
            case 'class':
                return this.browser.findElements(By.className(value));
            case 'id':
                return this.browser.findElements(By.id(value));
            case 'css':
                return this.browser.findElements(By.css(value));
            case 'xpath':
                return this.browser.findElements(By.xpath(value));
            case 'name':
                return this.browser.findElements(By.name(value));
        }
    }

    waitForElement(value, type) {
        switch (type) {
            case 'class':
                return this.browser.wait(until.elementLocated(By.className(value)));
            case 'id':
                return this.browser.wait(until.elementLocated(By.id(value)));
            case 'css':
                return this.browser.wait(until.elementLocated(By.css(value)));
            case 'xpath':
                return this.browser.wait(until.elementLocated(By.xpath(value)));
            case 'name':
                return this.browser.wait(until.elementLocated(By.name(value)));
        }
    }

    login(loginSpec) {
        const { url, credentials, selectors } = loginSpec;
        return this.browser.get(url)
            .then(res => this.waitForElement(selectors.user.value, selectors.user.type))
            .then(res => this.findElement(selectors.user.value, selectors.user.type).sendKeys(credentials.user))
            .then(res => this.findElement(selectors.password.value, selectors.password.type).sendKeys(credentials.password))
            .then(res => this.findElement(selectors.submit.value, selectors.submit.type).click())
            .then(res => this.browser.wait(until.elementLocated(By.tagName('body'))));
    }

    loadFirstIndexPage(firstIndexUrl) {
        return this.browser.get(firstIndexUrl);
    }

    scrapeIndexPage(selectors) {
        let url = null;
        return this.browser.getCurrentUrl()
            .then(res => url = res)
            .then(res => this.waitForElement(selectors.listings.value, selectors.listings.type))
            .then(res => this.findElements(selectors.listings.value, selectors.listings.type))
            .then(elements => {
                if (elements.length === 0) {
                    return Promise.reject('No more elements in index');
                }
                let currElements = elements;
                const indexes = [];
                for (let i = 0; i < currElements.length; i++) {
                    indexes.push(i);
                }
                return Promise.each(indexes, i => {
                    if (this.flushAfter === this.dataCache.length) {
                        this.flushDataCache();
                    }
                    return currElements[i].click().then(res => this.browser.getPageSource())
                        .then(html => this.consumePageSource(html))
                        .then(processedHtml => this.dataCache.push(processedHtml))  
                        .then(res => this.browser.get(url))
                        .then(res => this.waitForElement(selectors.listings.value, selectors.listings.type))
                        .then(res => this.findElements(selectors.listings.value, selectors.listings.type))
                        .then(res => currElements = res)
                        .catch(err => { console.log(err); Promise.resolve(); });
                });
            });
    }

    scrapeIndexPages(indexParserSpec) {
        const { firstIndexUrl, selectors, stopAfter } = indexParserSpec;
        return this.loadFirstIndexPage(firstIndexUrl)
            .then(res => this.scrapeIndexPagesRescurve(selectors, stopAfter))
            .catch(err => { console.log(err); return this.flushDataCache() });
    }

    scrapeIndexPagesRescurve(selectors, stopAfter=null) {
        if (this.indexPagesProcessed === stopAfter) {
            return Promise.reject('Reached stopAfter index pages visited.');
        }
        return this.scrapeIndexPage(selectors)
            .then(res => this.advanceToNextIndexPage(selectors.nextPageSelector, ++this.indexPagesProcessed))
            .then(res => this.scrapeIndexPagesRescurve(selectors, stopAfter))
    }

    getNextPaginationUrl(pageNumber) {
        return this.paginationUrlTemplate.replace('{PAGE_PARAMETER}', pageNumber);
    }

    advanceToNextIndexPage(nextPageSelector, pageNumber) {
        if (this.paginationType === 'URL') {
            return this.browser.get(this.getNextPaginationUrl(pageNumber));
        } else {
            return this.findElement(nextPageSelector.value, nextPageSelector.type);
        }
    }

    setConsumerFunction(consumerFunction) {
        this.consumerFunction = consumerFunction;
    }

    consumePageSource(html) {
        return this.consumerFunction(html);
    }

    flushDataCache() {
        fs.appendFileSync(`${this.dataPath}/${+ new Date()}.json`, JSON.stringify(this.dataCache));
        this.dataCache = [];
    }
}

module.exports = SeleniumDeliveryMedium;
