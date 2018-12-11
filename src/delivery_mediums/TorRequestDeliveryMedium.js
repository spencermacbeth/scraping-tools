const RequestDeliveryMedium = require('./RequestDeliveryMedium.js');
const tr = require('tor-request');

/**
 * This class overrides the makeGetRequest and makePostRequest methods of the RequestDeliveryMedium
 * class to use the TOR network, and utilizes the rest of RequestDeliveryMediums underying machinery.
 */
class TorRequestDeliveryMedium extends RequestDeliveryMedium {
    
    makeGetRequest(requestUrl, options={}) {
        return new Promise((res, rej) => {
            const getOptions = Object.assign({ method: 'GET', url: requestUrl }, options);
            return tr.request(getOptions, (err, resp, body) => {
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
            const postOptions = Object.assign({ method: 'POST', url: requestUrl }, options);
            return tr.request(postOptions, (err, resp, body) => {
                if (err) {
                    rej(err);
                }
                this.cookieString += ';' + resp.headers['set-cookie'];
                res(body);
            });
        });
    }
}

module.exports = TorRequestDeliveryMedium;