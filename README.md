# scraping-tools

A set of high-level tools for commonly implemented patterns of web scraping.

This project is currently a high-level interface for configuring scrapers for websites which follow a commonly encountered design via either Selenium-based or request-based communcation mediums. The website design currently supported for consumption by this project is that of paginated listings of links to content. For instance, this tool could be configured to scrape the contents of a forum's discussion pages (provided it was not against the ToS to do so).


## Configuration

Configuration of the paths to where application data files generated should be stored, where temporary files should be stored during tests, and where testing resoures are to be found can be done in the file `config/index.js`. The config boilerplate is provided in config/index.js.example.

If you want to run live tests, these are enabled via the `config/index.js` as well. The boilerplate for a live test of kijiji phone listings is provided out of the box, you just have to fill in the credentials, cookies, and necessary params such as the csfr token and redirect hashes used as additional parameters in some requests. This is left to the user to probe for. The purpose of this boilerplate is so that it can be re-used for during development of configurations for other sites. Live tests are disabled by default.

Note that during testing, a server is started on `http://localhost:3000` for tests of Selenium-based DeliveryMediums.


## Interface

The "exposed" functions of the DeliveryMedium interface provide support for logging in to a site with a simple
login form and traversal of index pages and consumption of their listings via a custom callback function. A default item content page consumer function which saves the HTML of the item pages is provided out of the box. An in-memory array is used to cache the results of the parsed HTML processed by the consumer function. You can specify the amount items you would like to be cached before flushing via the `flushAfter` property of the constructor config objects. If `stopAfter` is not specified, the cache will only be flushed after the index page traversal terminates. The page treversal terminates when no content listings with the specified DOM query can be found.

#### Sample config objects for RequestDeliveryMedium constructor:

Config for RequestDeliveryMedium when index page pagination is traversable via GET requests in the URL:
```
{
    paginationType: 'URL',
    paginationUrlTemplate: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/page-{PAGE_PARAMETER}',
    flushAfter: 5,
}
```
Config for RequestDeliveryMedium when index page pagination is traversable via a next button. Note that the `nextPageSelector` must be provided in the specification object for `DeliveryMedium.scrapeIndexPages`:
```
{
    paginationType: 'NEXT',
}
```

#### Sample config objects for SeleniumDeliveryMedium constructor:

Config for SeleniumDeliveryMedium when index page pagination is traversable via GET requests in the URL:
```
{
    browserType: 'firefox',
    paginationType: 'URL',
    paginationUrlTemplate: 'http://localhost:3000/listings/{PAGE_PARAMETER}',
    browserOptions: {
        headless: true,
    },
    flushAfter: 5,
};
```

Config for SeleniumDeliveryMedium when index page pagination is traversable via a next button. Once again, note that the `nextPageSelector` must be provided in the specification object for `DeliveryMedium.scrapeIndexPages`:
```
{
    browserType: 'firefox',
    paginationType: 'NEXT',
    browserOptions: {
        headless: true,
    },
}
```

#### Sample config object for RequestDeliveryMedium.login:
```
const loginSpec = {
    url: 'http://localhost:3000/',
    options: {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        form: {
            targetUrl: 'http://localhost:3000/login.php',
            emailOrNickname: 'test@email.com',
            password: 'test',
        },
    }
    method: 'POST',
};
```

#### Sample config object for SeleniumDeliveryMedium.login:
```
const loginSpec = {
    url: 'http://localhost:3000/',,
    credentials: {
        user:  'test@email.com',
        password: 'test',
    };,
    selectors: {
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
    },
}
```

#### Sample config object for RequestDeliveryMedium.scrapeIndexPages:
```
const indexScraperSpec = {
    firstIndexUrl: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/c132l1700272',
    selectors: {
        listings: {
            value: 'div.search-item.regular-ad',
            type: 'css',
        },
        nextPageSelector: {
            value: 'a[title="Next"]',
        }
    },
    stopAfter: 10
};
```

#### Sample config object for SeleniumDeliveryMedium.scrapeIndexPages:
```
const indexScraperSpec = {
    firstIndexUrl: 'https://www.kijiji.ca/b-phone-tablet/gta-greater-toronto-area/c132l1700272',
    selectors: {
        listings: {
            value: 'div.search-item.regular-ad',
            type: 'css',
        },
        nextPageSelector: {
            value: 'a[title="Next"]',
        }
    },
    stopAfter: 10
};
```           

Cheerio is used under the hood to find elements for the RequestDeliveryMedium class, so for the most generalizability it is currently best to use CSS selectors in the specifications provided to functions. Note that the previous selector specification works for both the RequestDeliveryMedium and SeleniumDeliveryMedium classes.
