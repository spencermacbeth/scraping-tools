const nock = require('nock');
const fs = require('fs');
const { assert } = require('chai')
const DeliveryMedium = require('../../src/delivery_mediums/DeliveryMedium');
const config = require('../../config');
const server = require('../resources/server.js');

const testDataPath = config.testStoragePath;
const testResourcesPath = config.testResourcesPath;
const RUN_LIVE_TEST = config.liveTestConfig.DeliveryMedium.runLiveTest;

describe('DeliveryMediumFactory', () => {
    beforeEach(() => {
        const files = fs.readdirSync(testDataPath);
        files.forEach(f => fs.unlinkSync(`${testDataPath}/${f}`));
    });

    it('should successfully parse an index page with a RequestDeliveryMedium for a mock test', () => {
        // delivery medium setup
        const testConfig = {
            paginationType: 'URL',
            paginationUrlTemplate: 'http://localhost:3000/listings/{PAGE_PARAMETER}',
        };
        const deliveryMedium = new DeliveryMedium('request', testConfig);
        deliveryMedium.setDataPath(testDataPath);

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
            
            const listingsPerPage = 3;
            return assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage)
                .then(res => assert.equal(scope.isDone(), true));
    });

    it('should successfully parse an index page with a TorRequestDeliveryMedium for a mock test', () => {
        // delivery medium setup
        const testConfig = {
            paginationType: 'URL',
            paginationUrlTemplate: 'http://localhost:3000/listings/{PAGE_PARAMETER}',
        };
        const deliveryMedium = new DeliveryMedium('torRequest', testConfig);
        deliveryMedium.setDataPath(testDataPath);

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
            
            const listingsPerPage = 3;
            return assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage)
                .then(res => assert.equal(scope.isDone(), true));
    });

    it('should successfully parse an index page with a SeleniumDeliveryMedium for a mock test', () => {
        server.listen(3000);

        // delivery medium setup
        const testConfig = {
            browserType: 'firefox',
            paginationType: 'URL',
            paginationUrlTemplate: 'http://localhost:3000/listings/{PAGE_PARAMETER}',
            browserOptions: {
                headless: true,
            },
        };
        const deliveryMedium = new DeliveryMedium('selenium', testConfig);
        deliveryMedium.setDataPath(testDataPath);

        // test login config
        const loginUrl = 'http://localhost:3000/login';
        const testCredentials = {
            user:  'test@email.com',
            password: 'test',
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
        const listingsPerPage = 3;
        return assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage)
            .then(res => server.close());
    });

    if (RUN_LIVE_TEST === true) {
        it('should successfully parse an index page with a RequestDeliveryMedium for a live test', () => {
            // delivery medium setup
            const testConfig = {
                paginationType: 'URL',
                paginationUrlTemplate: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/page-{PAGE_PARAMETER}/c132l1700272',
            }
    
            // test login config
            const loginUrl = 'https://www.kijiji.ca/t-login.html';
            const loginOptions = {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'origin': 'https://www.kijiji.ca',
                    'referer': 'https://www.kijiji.ca/t-login.html',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
                    'Cookie': 'kjses=81475f0b-61c4-4d50-a4a4-ceff7f55f921^wZgBa4Lh52/XqQVN9TB2yA==; siteLocale=en_CA; machId=e999528b665a6133b336442a20aaa49cea058d71bd6abd70e11bfbe7fb143f696fcdd6a017457e93ce3ef06659bda91169e2c7d050e4c3d3b78bce933ddf72b9; cguid=Vcguid=1c92e9491670a9c49711e3c7f2fdb926^doml=true^brl=true; optimizelyEndUserId=oeu1542372648584r0.383012687077775; ki_r=; _ga=GA1.2.1750213704.1542372650; _gid=GA1.2.978731531.1542372650; cto_lwid=10c1abf6-4c4b-4028-9287-ff32104be7b1; __gads=ID=a4ef4584385a9d37:T=1542372650:S=ALNI_MaL4a-rq4uxcf3OEpjgS8l7xhv-Qg; AAMC_kijiji_0=REGION%7C9; aam_uuid=69980375669579622080919822446494080265; fab=0; ab=0; rememberMe=Vrme=false; _fbp=fb.1.1542372765341.1055827029; _dm_sync=true; kjrva=; ad_ids_s=Vsaved_s=; up=%7B%22ln%22%3A%22191279465%22%2C%22ls%22%3A%22l%3D1700228%26sv%3DLIST%26sf%3DdateDesc%22%7D; _gat=1; JSESSIONID=7C3FC2112365E615050A2066CC4EB104; ki_t=1542372649352%3B1542372649352%3B1542372830090%3B1%3B9; algoliaToken=eyJhcGlLZXkiOiJNV016TjJVM1ptRTRaamswTkRnd1pHRTFNalUwTm1KalkyVTJORGhrT1RBelpqazJPV0k1T1RZek5qSTROelJpWkRCak1qWmlNakJpTXpBeFpqSmhZblpoYkdsa1ZXNTBhV3c5TVRVME1qUTFPVEl6TWpnMk9RPT0iLCJhcHBJZCI6IjNJRDc4WU1PV1UiLCJpbmRleCI6ImtjYV9wcm9kX3N1Z2dlc3QiLCJ2YWxpZFVudGlsIjoxNTQyNDU5MjMyODY5fQ==; _gali=SignInButton'
                },
                form: {
                    targetUrl: 'L15udS9JWHhHMURBNmdjdkFuTFJJeUR3PT0-',
                    emailOrNickname: 'qwerttrew9876@gmail.com',
                    password: 'Letmein!111',
                    'ca.kijiji.xsrf.token': '1542372829359.c2aefc230fa17091c53e0274d1aae177d822753f395d240595060893e94fab49'
                },
            };
            const loginSpec = {
                url: loginUrl,
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
    
            const deliveryMedium = new DeliveryMedium('request', testConfig);
            deliveryMedium.setDataPath(testDataPath);
            const listingsPerPage = 20;
            return assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage);
        });
    
        it('should successfully parse an index page with a SeleniumDeliveryMedium for a live test', () => {
            // delivery medium setup
            const testConfig = {
                browserType: 'firefox',
                paginationType: 'URL',
                paginationUrlTemplate: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/page-{PAGE_PARAMETER}/c132l1700272',
                browserOptions: {
                    headless: false,
                },
            };
            
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
            
            const deliveryMedium = new DeliveryMedium('selenium', testConfig);
            deliveryMedium.setDataPath(testDataPath);
            const listingsPerPage = 20;
            return assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage);
        });
    }
});

function assertDeliveryMediumParsesIndex(deliveryMedium, loginSpec, indexScraperSpec, listingsPerPage) {
    return deliveryMedium.login(loginSpec)
    .then(res => deliveryMedium.scrapeIndexPages(indexScraperSpec))
    .then(res => {
        const files = fs.readdirSync(testDataPath);
        const result = files.reduce((acc, f) => {
            const data = require(`${testDataPath}/${f}`);
            return [...acc, ...data];
        }, []);
        assert.equal(result.length, indexScraperSpec.stopAfter * listingsPerPage);
        deliveryMedium.destroy();
    });
}

