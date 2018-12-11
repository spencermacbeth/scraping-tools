
const DeliveryMediumFactory = require('./DeliveryMediumFactory.js');

class DeliveryMedium {
   
    /**
     * Instantiates a DelieveryMedium object according to the specified config.
     * The pagination types supported are currently URL-based and next-button based.
     * For details on the structures of these objects, see the README.
     * 
     * @param {Object} deliveryMediumConfig 
     */
    constructor(type, config) {
        this.deliveryMedium = DeliveryMediumFactory.getDeliveryMedium(type, config);
    }

    /**
     * Performs a login operation according to the provided spcifications.
     * For details on the structures of these objects, see the README.
     * 
     * @param {Object} loginSpec
     */
    login(loginSpec) {
        return this.deliveryMedium.login(loginSpec);
    }

    /**
     * Scrapes anc consumes index pages according to the provided spcifications.
     * For details on the structures of these objects, see the README.
     * 
     * @param {Object} loginSpec
     */
    scrapeIndexPages(indexParserSpec) {
        return this.deliveryMedium.scrapeIndexPages(indexParserSpec);
    }

    /**
     * Destroys the DeliveryMedium instance.
     */
    destroy() {
        return this.deliveryMedium.destroy();
    }

    /**
     * Set the path to where data is to be stored by the DeliveryMedium instance.
     * 
     * @param {String} dataPath 
     */
    setDataPath(dataPath) {
        return this.deliveryMedium.setDataPath(dataPath);
    }
}

module.exports = DeliveryMedium;
