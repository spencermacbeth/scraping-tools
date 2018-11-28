const fs = require('fs');
const { assert } = require('chai');
const config = require('../../config');
const SeleniumDeliveryMedium = require('../../src/delivery_mediums/SeleniumDeliveryMedium');
const server = require('../resources/server.js');

const testDataPath = config.testStoragePath;
const RUN_LIVE_TEST = config.liveTestConfig.SeleniumDeliveryMedium.runLiveTest;

describe('SeleniumDeliveryMedium', () => {
    beforeEach(() => {
        const files = fs.readdirSync(testDataPath);
        files.forEach(f => fs.unlinkSync(`${testDataPath}/${f}`));
    });

    it('should parse the correct number of index pages for a mock test when using next pagination', () => {
        server.listen(3000);

        // delivery medium setup
        const testConfig = {
            browserType: 'firefox',
            paginationType: 'NEXT',
            browserOptions: {
                headless: true,
            },
        };
        const seleniumDeliveryMedium = new SeleniumDeliveryMedium(testConfig);
        seleniumDeliveryMedium.setDataPath(testDataPath);

        // test login config
        const loginUrl = 'http://localhost:3000/login';
        const testCredentials = {
            user:  '',
            password: '',
        };
        const testSelectors = {
            user: {
                value: 'username',
                type: 'id'
            },
            password: {
                value: 'password',
                type: 'id',
            },
            submit: {
                value: 'submit',
                type:'id'
            },
        };
        const loginSpec = {
            url: loginUrl,
            credentials: testCredentials,
            selectors: testSelectors,
        }

        // test index scraper config
        const firstIndexUrl = 'http://localhost:3000/listings/1';
        const indexSelectors = {
            listings: {
                value: '.test-listing',
                type: 'css'
            },
            nextPageSelector: {
                value: '.test-next-page',
                type: 'css',
            }
        };
        const stopAfter = 2;
        const indexScraperSpec = {
            firstIndexUrl: firstIndexUrl,
            selectors: indexSelectors,
            stopAfter: stopAfter,
        }

        return seleniumDeliveryMedium.login(loginSpec)
            .then(res => seleniumDeliveryMedium.scrapeIndexPages(indexScraperSpec))
            .then(res => {
                const listingsPerPage = 3;
                const files = fs.readdirSync(testDataPath);
                const result = files.reduce((acc, f) => {
                    const data = require(`${testDataPath}/${f}`);
                    return [...acc, ...data];
                }, []);
                assert.equal(result.length, stopAfter * listingsPerPage);
                server.close();
                seleniumDeliveryMedium.destroy();
            });

    });

    it('should parse the correct number of index pages for a mock test when using URL pagination', () => {
        server.listen(3000);

        // delivery medium setup
        const testConfig = {
            browserType: 'firefox',
            paginationType: 'NEXT',
            browserOptions: {
                headless: true,
            },
        };
        const seleniumDeliveryMedium = new SeleniumDeliveryMedium(testConfig);
        seleniumDeliveryMedium.setDataPath(testDataPath);

        // test login config
        const loginUrl = 'http://localhost:3000/login';
        const testCredentials = {
            user:  '',
            password: '',
        };
        const testSelectors = {
            user: {
                value: 'username',
                type: 'id'
            },
            password: {
                value: 'password',
                type: 'id',
            },
            submit: {
                value: 'submit',
                type:'id'
            },
        };
        const loginSpec = {
            url: loginUrl,
            credentials: testCredentials,
            selectors: testSelectors,
        }

        // test index scraper config
        const firstIndexUrl = 'http://localhost:3000/listings/1';
        const indexSelectors = {
            listings: {
                value: '.test-listing',
                type: 'css'
            },
            nextPageSelector: {
                value: '.test-next-page',
                type: 'css',
            }
        };
        const stopAfter = 2;
        const indexScraperSpec = {
            firstIndexUrl: firstIndexUrl,
            selectors: indexSelectors,
            stopAfter: stopAfter,
        }

        return seleniumDeliveryMedium.login(loginSpec)
            .then(res => seleniumDeliveryMedium.scrapeIndexPages(indexScraperSpec))
            .then(res => {
                const listingsPerPage = 3;
                const files = fs.readdirSync(testDataPath);
                const result = files.reduce((acc, f) => {
                    const data = require(`${testDataPath}/${f}`);
                    return [...acc, ...data];
                }, []);
                assert.equal(result.length, stopAfter * listingsPerPage);
                server.close();
                seleniumDeliveryMedium.destroy();
            });

    });

    if (RUN_LIVE_TEST === true) {
        it('should parse the correct number of index pages for a live test', () => {
            // delivery medium setup
            const testConfig = {
                browserType: 'firefox',
                paginationType: 'URL',
                paginationUrlTemplate: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/page-{PAGE_PARAMETER}/c132l1700272',
                browserOptions: {
                    headless: false,
                },
            };
            const seleniumDeliveryMedium = new SeleniumDeliveryMedium(testConfig);
            seleniumDeliveryMedium.setDataPath(testDataPath);
            
            // test login config
            const loginUrl = 'https://www.kijiji.ca/t-login.html';
            const testCredentials = {
                user:  '',
                password: '',
            };
            const testSelectors = {
                user: {
                    value: 'LoginEmailOrNickname',
                    type: 'id'
                },
                password: {
                    value: 'login-password',
                    type: 'id',
                },
                submit: {
                    value: 'SignInButton',
                    type:'id'
                },
            };
            const loginSpec = {
                url: loginUrl,
                credentials: testCredentials,
                selectors: testSelectors,
            }

            // test index scraper config
            const firstIndexUrl = 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/c132l1700272';
            const indexSelectors = {
                listings: {
                    value: 'div.search-item.regular-ad',
                    type: 'css',
                },
            };
            const stopAfter = 1;
            const indexScraperSpec = {
                firstIndexUrl: firstIndexUrl,
                selectors: indexSelectors,
                stopAfter: stopAfter
            };

            return seleniumDeliveryMedium.login(loginSpec)
                .then(res => seleniumDeliveryMedium.scrapeIndexPages(indexScraperSpec))
                .then(res => {
                    const listingsPerPage = 20;
                    const files = fs.readdirSync(testDataPath);
                    const result = files.reduce((acc, f) => {
                        const data = require(`${testDataPath}/${f}`);
                        return [...acc, ...data];
                    }, []);
                    assert.equal(result.length, stopAfter * listingsPerPage);
                    seleniumDeliveryMedium.destroy();
                });
        });
    }
});
