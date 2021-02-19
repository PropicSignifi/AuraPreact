describe("$DataProducer", function() {
    const $DataProducer = window.$DataProducer;

    const dataProducer1 = {
        produce: function() {
            return [1, 2, 3];
        },
    };

    const dataProducer2 = {
        produce: function() {
            return new Promise((resolve, reject) => {
                resolve([1, 2, 3]);
            });
        },
    };

    it("should manage data producers", function() {
        $DataProducer.addDataProducer("data1", dataProducer1);
        $DataProducer.addDataProducer("data2", dataProducer2);
        expect($DataProducer.getDataProducer("data1")).not.toBeUndefined();
        expect(_.size($DataProducer.getDataProducers()) >= 2).toBe(true);

        $DataProducer.removeDataProducer("data1");
        expect($DataProducer.getDataProducer("data1")).toBeUndefined();
    });

    it("should produce data", function() {
        $DataProducer.addDataProducer("data1", dataProducer1);
        $DataProducer.addDataProducer("data2", dataProducer2);

        $DataProducer.produce("data1").then(data => {
            expect(data).toEqual([1, 2, 3]);
        });

        $DataProducer.produce("data2").then(data => {
            expect(data).toEqual([1, 2, 3]);
        });
    });
});
