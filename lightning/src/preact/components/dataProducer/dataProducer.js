const dataProducers = {};

export const registerDataProducer = (name, producer) => {
    if(name && producer) {
        dataProducers[name] = producer;
    }
};

export const unregisterDataProducer = name => {
    if(name) {
        delete dataProducers[name];
    }
};

export const getDataProducers = () => dataProducers;

export const getDataProducer = name => name && dataProducers[name];

export const produce = (name, params) => {
    const dataProducer = dataProducers[name];
    if(_.isFunction(dataProducer)) {
        return dataProducer(params);
    }
    else if(_.isPlainObject(dataProducer) && _.isFunction(dataProducer.produce)) {
        return dataProducer.produce(params);
    }
};
