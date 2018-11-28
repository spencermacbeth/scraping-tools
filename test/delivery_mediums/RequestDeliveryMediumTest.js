const nock = require('nock');
const fs = require('fs');
const { assert } = require('chai')
const config = require('../../config');
const RequestDeliveryMedium = require('../../src/delivery_mediums/RequestDeliveryMedium');

const testDataPath = config.testStoragePath;
const testResourcesPath = config.testResourcesPath;
const RUN_LIVE_TEST = config.liveTestConfig.RequestDeliveryMedium.runLiveTest;

describe('RequestDeliveryMedium', () => {
    beforeEach(() => {
        const files = fs.readdirSync(testDataPath);
        files.forEach(f => fs.unlinkSync(`${testDataPath}/${f}`));
    });

    it('should parse the correct number of index pages for a mock test when using next href pagination', () => {
        // delivery medium setup
        const testConfig = {
            paginationType: 'NEXT',
        }
        const requestDeliveryMedium = new RequestDeliveryMedium(testConfig);
        requestDeliveryMedium.setDataPath(testDataPath);

        // test login config
        const loginUrl = 'http://localhost:3000/';
        const loginOptions = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            form: {
                targetUrl: 'http://localhost:3000/login.php',
                emailOrNickname: 'test@email.com',
                password: 'test',
            },
        };

        const loginSpec = {
            url: loginUrl,
            options: loginOptions,
            method: 'POST',
        };

        // test index scraper config
        const firstIndexUrl = 'http://localhost:3000/listings/1';
        const indexSelectors = {
            listings: {
                value: '.test-listing'
            },
            nextPageSelector: {
                value: '.test-next-page',
            }
        };
        const stopAfter = 2;
        const indexScraperSpec = {
            firstIndexUrl: firstIndexUrl,
            selectors: indexSelectors,
            stopAfter: stopAfter,
        }

        const loginRespHtml = fs.readFileSync(`${testResourcesPath}/loginPage.html`);
        const indexPageHtml = fs.readFileSync(`${testResourcesPath}/indexPage.html`);
        const itemPageHtml = fs.readFileSync(`${testResourcesPath}/itemPage.html`);
        const scope = nock(loginSpec.url)
            .post('/')
            .reply(200, loginRespHtml)
            .get('/listings/1')
            .reply(200, indexPageHtml)
            .get('/items/1')
            .reply(200, itemPageHtml)
            .get('/items/2')
            .reply(200, itemPageHtml)
            .get('/items/3')
            .reply(200, itemPageHtml)
            .get('/listings/2')
            .reply(200, indexPageHtml)
            .get('/items/1')
            .reply(200, itemPageHtml)
            .get('/items/2')
            .reply(200, itemPageHtml)
            .get('/items/3')
            .reply(200, itemPageHtml);
            
        return requestDeliveryMedium.login(loginSpec)
            .then(res => requestDeliveryMedium.scrapeIndexPages(indexScraperSpec))
            .then(res => {
                const listingsPerPage = 3;
                const files = fs.readdirSync(testDataPath);
                const result = files.reduce((acc, f) => {
                    const data = require(`${testDataPath}/${f}`);
                    return [...acc, ...data];
                }, []);
                assert.equal(result.length, stopAfter * listingsPerPage);
                assert.equal(scope.isDone(), true);
            });
    });


    it('should parse the correct number of index pages for a mock test when using URL pagination', () => {
        // delivery medium setup
        const testConfig = {
            paginationType: 'URL',
            paginationUrlTemplate: 'http://localhost:3000/listings/{PAGE_PARAMETER}',
        }
        const requestDeliveryMedium = new RequestDeliveryMedium(testConfig);
        requestDeliveryMedium.setDataPath(testDataPath);

        // test login config
        const loginUrl = 'http://localhost:3000/';
        const loginOptions = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            form: {
                targetUrl: 'http://localhost:3000/login.php',
                emailOrNickname: 'test@email.com',
                password: 'test',
            },
        };

        const loginSpec = {
            url: loginUrl,
            options: loginOptions,
            method: 'POST',
        };

        // test index scraper config
        const firstIndexUrl = 'http://localhost:3000/listings/1';
        const indexSelectors = {
            listings: {
                value: '.test-listing'
            },
            nextPageSelector: {
                value: '.test-next-page',
            }
        };
        const stopAfter = 2;
        const indexScraperSpec = {
            firstIndexUrl: firstIndexUrl,
            selectors: indexSelectors,
            stopAfter: stopAfter,
        }

        const loginRespHtml = fs.readFileSync(`${testResourcesPath}/loginPage.html`);
        const indexPageHtml = fs.readFileSync(`${testResourcesPath}/indexPage.html`);
        const itemPageHtml = fs.readFileSync(`${testResourcesPath}/itemPage.html`);
        const scope = nock(loginSpec.url)
            .post('/')
            .reply(200, loginRespHtml)
            .get('/listings/1')
            .reply(200, indexPageHtml)
            .get('/items/1')
            .reply(200, itemPageHtml)
            .get('/items/2')
            .reply(200, itemPageHtml)
            .get('/items/3')
            .reply(200, itemPageHtml)
            .get('/listings/2')
            .reply(200, indexPageHtml)
            .get('/items/1')
            .reply(200, itemPageHtml)
            .get('/items/2')
            .reply(200, itemPageHtml)
            .get('/items/3')
            .reply(200, itemPageHtml);
            
        return requestDeliveryMedium.login(loginSpec)
            .then(res => requestDeliveryMedium.scrapeIndexPages(indexScraperSpec))
            .then(res => {
                const listingsPerPage = 3;
                const files = fs.readdirSync(testDataPath);
                const result = files.reduce((acc, f) => {
                    const data = require(`${testDataPath}/${f}`);
                    return [...acc, ...data];
                }, []);
                assert.equal(result.length, stopAfter * listingsPerPage);
                assert.equal(scope.isDone(), true);
            });
    });

    if (RUN_LIVE_TEST === true) {
        it('should parse the correct number of index pages for a live test', () => {
            // delivery medium setup
            const testConfig = {
                paginationType: 'URL',
                paginationUrlTemplate: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/page-{PAGE_PARAMETER}/c132l1700272',
            }
            const requestDeliveryMedium = new RequestDeliveryMedium(testConfig);
            requestDeliveryMedium.setDataPath(testPath);
    
            // test login config
            const loginUrl = 'https://www.kijiji.ca/t-login.html';
            const loginOptions = {
                // configure testing login request headers
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'origin': 'https://www.kijiji.ca',
                    'referer': 'https://www.kijiji.ca/t-login.html',
                    'Cookie': '' // configure auth cookies if desired
                },
                // configure testing login request parameters
                form: {
                    targetUrl: '', 
                    emailOrNickname: '',
                    password: '',
                    'ca.kijiji.xsrf.token': ''
                },
            };
    
            const loginSpec = {
                loginUrl: loginUrl,
                options: loginOptions,
                method: 'POST',
            };
    
            // test index scraper config
            const firstIndexUrl = 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/c132l1700272';
            const indexSelectors = {
                listings: {
                    value: '.search-item.regular-ad'
                },
                nextPageSelector: {
                    value: 'a[title="Next"]',
                }
            };
            const stopAfter = 1;
            const indexScraperSpec = {
                firstIndexUrl: firstIndexUrl,
                selectors: indexSelectors,
                stopAfter: stopAfter,
            }
            return requestDeliveryMedium.login(loginSpec)
                .then(res => requestDeliveryMedium.scrapeIndexPages(indexScraperSpec))
                .then(res => {
                    const listingsPerPage = 20;
                    const files = fs.readdirSync(testDataPath);
                    const result = files.reduce((acc, f) => {
                        const data = require(`${testDataPath}/${f}`);
                        return [...acc, ...data];
                    }, []);
                    assert.equal(result.length, stopAfter * listingsPerPage);
                });
        });
    }
});
