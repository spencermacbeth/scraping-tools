
const RequestDeliveryMedium = require('./RequestDeliveryMedium.js');
const TorRequestDeliveryMedium = require('./TorRequestDeliveryMedium.js');
const SeleniumDeliveryMedium = require('./SeleniumDeliveryMedium.js');

const DeliveryMediumFactory = {
    DELIVERY_MEDIUM_TYPES: [
        'selenium',
        'request',
    ],
    getDeliveryMedium: (deliveryMedium, config) => {
        switch (deliveryMedium.toLowerCase()) {
            case 'request':
                return new RequestDeliveryMedium(config);
            case 'torrequest':
                return new TorRequestDeliveryMedium(config);
            case 'selenium':
                return new SeleniumDeliveryMedium(config);
            default:
                throw new Error('Invalid delivery medium type requested.');
        }
    }
}


module.exports = DeliveryMediumFactory;
