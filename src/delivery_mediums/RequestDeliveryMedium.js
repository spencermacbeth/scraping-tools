
const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const url = require('url');
const config = require('../../config');

class RequestDeliveryMedium {

    /**
     * Instantiates a RequestDelieveryMedium object according to the specified config.
     * The pagination types supported are currently URL-based and next-button based.
     * 
     * @param {Object} deliveryMediumConfig 
     */
    constructor(deliveryMediumConfig) {
        // class constants
        this.SUPPORTED_METHODS = ['GET', 'POST'];
        this.dataCache = [];
        this.dataPath = config.appStoragePath;
        this.indexPagesProcessed = 0;
        this.cookieString = '';

        // parameterized values
        this.paginationSelector = deliveryMediumConfig.paginationSelector;
        this.paginationType = deliveryMediumConfig.paginationType;
        this.paginationUrlTemplate = deliveryMediumConfig.paginationUrlTemplate;
        this.paginationSelector = deliveryMediumConfig.paginationSelector;
        this.flushAfter = deliveryMediumConfig.flushAfter;
        this.consumerFunction = deliveryMediumConfig.consumerFunction || function (html) { return html };
    }

    destroy() {}

    setDataPath(dataPath) {
        this.dataPath = dataPath;
    }

    makeGetRequest(requestUrl, options={}) {
        return new Promise((res, rej) => {
            return request.get(requestUrl, options, (err, resp, body) => {
                if (err) {
                    rej(err);
                }
                this.cookieString += ';' + resp.headers['set-cookie'];
                return res(body);
            });
        });
    }

    makePostRequest(requestUrl, options) {
        return new Promise((res, rej) => {
            return request.post(requestUrl, options, (err, resp, body) => {
                if (err) {
                    rej(err);
                }
                this.cookieString += ';' + resp.headers['set-cookie'];
                res(body);
            });
        });
    }

    login(loginSpec) {
        const { url, options, method } = loginSpec;
        return this.makeRequest(url, options, method)
    }

    makeRequest(requestUrl, options={}, method=null) {
        const finalMethod = method === null ? 'get' : method;
        switch (finalMethod.toLowerCase()) {
            case 'get':
                return this.makeGetRequest(requestUrl, options);
            case 'post':
                return this.makePostRequest(requestUrl, options);
            default:
                return Promise.reject('Unsupported HTTP method provided.');
        }
    }

    requestIndexLinkPages(links, method=null) {
        return Promise.each(links, link => {
            if (this.flushAfter === this.dataCache.length) {
                this.flushDataCache();
            }
            return this.makeRequest(link, null, null, method)
                .then(html => this.consumePageSource(html))
                .then(res => this.dataCache.push(res))
        });
    }

    scrapeIndexPages(indexParserSpec) {
        const { firstIndexUrl, selectors, stopAfter, options, method } = indexParserSpec;
        return this.scrapeIndexPagesRecursive(firstIndexUrl, selectors, stopAfter, options, method)
            .catch(err => { console.log(err); return this.flushDataCache() });
    }

    scrapeIndexPagesRecursive(indexUrl, selectors,  stopAfter, options, method) {
        if (this.indexPagesProcessed === stopAfter) {
            return Promise.reject('Reached stopAfter pages processed.');
        }
        let $ = null;
        this.indexPagesProcessed++;
        return this.makeRequest(indexUrl, options, method)
            .then(cheerio.load)
            .then(res => $ = res)
            .then(res => this.parseIndexPage($, selectors, indexUrl))
            .then(res => this.requestIndexLinkPages(res))
            .then(res => this.getNextPageUrl($, selectors, indexUrl))
            .then(nextPageUrl => this.scrapeIndexPagesRecursive(nextPageUrl, selectors, stopAfter, options, method));
    }

    retrieveHref($, selector) {
        const tag = $(selector);
        return $(tag).attr('tagName') === 'A'
            ? $(tag).attr('href')
            : $(tag).find('a').prop('href');
    }

    getNextPageUrl($, selectors, indexUrl) {
        if (this.paginationType === 'URL') {
            return this.paginationUrlTemplate.replace('{PAGE_PARAMETER}', this.indexPagesProcessed + 1);
        }
        else {
            return this.getNextPageUrlFromNextButton($, selectors, indexUrl);
        }
    }

    getNextPageUrlFromNextButton($, selectors, indexUrl) {
        const host = url.parse(indexUrl).hostname;
        const href = this.retrieveHref($, selectors.nextPageSelector.value);
        let link = href;
        if (!href.startsWith('http://')) {
            link = host + href;
        }
        return link;
    }

    parseIndexPage($, selectors, currentUrl) {
        const parsedUrl = url.parse(currentUrl); 
        const host = parsedUrl.protocol + '//' + parsedUrl.hostname;
        const linkElements = $(selectors.listings.value).toArray();
        if (linkElements.length === 0) {
            return Promise.reject('No more links on index page.');
        } 
        const links = linkElements.map(l => {
            const href = this.retrieveHref($, l);
            if (!href.startsWith('http://')) {
                return host + href;
            }
            return href;
        });
        return links;
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

module.exports = RequestDeliveryMedium;
