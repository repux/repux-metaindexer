const DIST_DIR = './../../dist/';

describe('Service - DataProductEventHandler', function() {

    function mockContractFactoryProvider(contracts) {
        return {
            getFactory: jasmine.createSpy('contractFactoryProvider.getFactory').and.callFake((contractName, version) => {
                return {
                    at: () => Promise.resolve(contracts[contractName])
                };
            }),
            getFactoryByAddress: jasmine.createSpy('contractFactoryProvider.getFactory').and.callFake((contractName, address) => {
                return Promise.resolve({
                    at: () => Promise.resolve(contracts[contractName])
                });
            }),
        };
    }

    describe('createEventIfItDoesntExist', () => {
        it('should return true if DataProductEvent was created', async () => {
            const esClient = { update: jasmine.createSpy('es.update') };

            const DataProductEventHandler = require(DIST_DIR + 'services/data-product-event-handler').DataProductEventHandler;
            const service = new DataProductEventHandler(esClient, 'test', {}, {}, {}, {}, {});

            const event = { transactionHash: 'hash' };

            esClient.update.and.returnValue(Promise.resolve({ result: 'created' }));
            let created = await service.createEventIfItDoesntExist(event);

            expect(esClient.update).toHaveBeenCalledTimes(1);
            expect(created).toBe(true);

            esClient.update.and.returnValue(Promise.resolve({ result: 'updated' }));
            created = await service.createEventIfItDoesntExist(event);

            expect(esClient.update).toHaveBeenCalledTimes(2);
            expect(created).toBe(false);
        });
    });

    describe('handleEnqueuedMessage', () => {
        it('should update data product data', async () => {
            const esClient = {
                update: jasmine.createSpy('es.update').and.returnValue(Promise.resolve({ result: 'created' }))
            };
            const logger = { info: jasmine.createSpy('logger.info') };
            const dataProductContract = { owner: () => 'owner-address'};
            const contractFactoryProvider = mockContractFactoryProvider({
                'DataProduct': dataProductContract
            });
            const dataProductUpdater = {
                handleDataProductUpdate: jasmine.createSpy('dataProductUpdater.handleDataProductUpdate')
                    .and.returnValue(Promise.resolve(dataProductContract))
            };
            const ratingsUpdater = {
                recalculateRatingsForUser: jasmine.createSpy('ratingsUpdater.recalculateRatingsForUser')
            };
            const wsNotifier = {
                notify: jasmine.createSpy('wsNotifier.notify')
            };

            const DataProductEventHandler = require(DIST_DIR + 'services/data-product-event-handler').DataProductEventHandler;
            const service = new DataProductEventHandler(
                esClient,
                'test',
                logger,
                contractFactoryProvider,
                dataProductUpdater,
                ratingsUpdater,
                wsNotifier
            );

            const messageBody = { transactionHash: 'hash', args: { action: 1 }, blockNumber: 234, address: '0x12345' };
            const message = { content: { toString: () => JSON.stringify(messageBody) } };

            await service.handleEnqueuedMessage(message);

            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledTimes(1);
            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledWith(
                dataProductContract,
                messageBody.blockNumber,
                messageBody.args.action,
                messageBody.address
            );

            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledTimes(1);
            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledWith('owner-address');

            expect(wsNotifier.notify).toHaveBeenCalledTimes(1);
            expect(wsNotifier.notify).toHaveBeenCalledWith(messageBody);

            esClient.update.and.returnValue(Promise.resolve({ result: 'not-created' }));

            await service.handleEnqueuedMessage(message);

            expect(wsNotifier.notify).toHaveBeenCalledTimes(1);

            await service.handleEnqueuedMessage(null);

            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledTimes(2);
            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledTimes(2);
            expect(wsNotifier.notify).toHaveBeenCalledTimes(1);
        });
    });
});
