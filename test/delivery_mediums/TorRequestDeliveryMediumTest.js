const { assert } = require('chai');
const config = require('../../config');
const nock = require('nock');
const fs = require('fs');
const TorRequestDeliveryMedium = require('../../src/delivery_mediums/TorRequestDeliveryMedium');

const testDataPath = config.testStoragePath;
const testResourcesPath = config.testResourcesPath;
const RUN_TOR_NETWORK_TEST = config.liveTestConfig.TorRequestDeliveryMedium.runTorNetworkTest;

describe('TorRequestDeliveryMedium', () => {
    beforeEach(() => {
        const files = fs.readdirSync(testDataPath);
        files.forEach(f => fs.unlinkSync(`${testDataPath}/${f}`));
    });

    it('should parse the correct number of index pages for a mock test when using next href pagination', () => {
        // delivery medium setup
        const testConfig = {
            paginationType: 'NEXT',
        }
        const requestDeliveryMedium = new TorRequestDeliveryMedium(testConfig);
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
    
    // TOR must be running on your computer for this test to pass
    if (RUN_TOR_NETWORK_TEST) {
        it('should get a tor network IP address', () => {
            const ipAddressApi = 'https://check.torproject.org/';
            const validatorString = 'Congratulations. This browser is configured to use Tor.';
            const torDeliveryMedium = new TorRequestDeliveryMedium({});
            return torDeliveryMedium.makeGetRequest(ipAddressApi)
                .then(res => assert.isTrue(res.includes(validatorString)));
        });
    }
});