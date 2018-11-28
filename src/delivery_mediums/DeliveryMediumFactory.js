
const RequestDeliveryMedium = require('/Users/spencermacbeth/Desktop/code/scrapeworks/src/delivery_mediums/RequestDeliveryMedium');
const SeleniumDeliveryMedium = require('/Users/spencermacbeth/Desktop/code/scrapeworks/src/delivery_mediums/SeleniumDeliveryMedium');

const DeliveryMediumFactory = {
    DELIVERY_MEDIUM_TYPES: [
        'selenium',
        'request',
    ],
    getDeliveryMedium: (deliveryMedium, config) => {
        switch (deliveryMedium.toLowerCase()) {
            case 'request':
                return new RequestDeliveryMedium(config);
            case 'selenium':
                return new SeleniumDeliveryMedium(config);
            default:
                throw new Error('Invalid delivery medium type requested.');
        }
    }
}


module.exports = DeliveryMediumFactory;
