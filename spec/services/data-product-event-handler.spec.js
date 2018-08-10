const DIST_DIR = './../../dist/';

describe('Service - DataProductEventHandler', function() {
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
            const dataProductContractFactory = {
                at: jasmine.createSpy('dataProductContractFactory.at').and.returnValue(Promise.resolve(dataProductContract))
            };
            const dataProductUpdater = {
                handleDataProductUpdate: jasmine.createSpy('dataProductUpdater.handleDataProductUpdate')
                    .and.returnValue(Promise.resolve(dataProductContract))
            };
            const ratingsUpdater = {
                recalculateRatingsForUser: jasmine.createSpy('ratingsUpdater.recalculateRatingsForUser')
            };
            const wsServer = {
                sendDataProductUpdate: jasmine.createSpy('wsServer.sendDataProductUpdate')
            };

            const DataProductEventHandler = require(DIST_DIR + 'services/data-product-event-handler').DataProductEventHandler;
            const service = new DataProductEventHandler(
                esClient,
                'test',
                logger,
                dataProductContractFactory,
                dataProductUpdater,
                ratingsUpdater,
                wsServer
            );

            const messageBody = { transactionHash: 'hash', args: { action: 1 }, blockNumber: 234 };
            const message = { content: { toString: () => JSON.stringify(messageBody) } };

            await service.handleEnqueuedMessage(message);

            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledTimes(1);
            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledWith(
                dataProductContract,
                messageBody.blockNumber,
                messageBody.args.action
            );

            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledTimes(1);
            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledWith('owner-address');

            expect(wsServer.sendDataProductUpdate).toHaveBeenCalledTimes(1);
            expect(wsServer.sendDataProductUpdate).toHaveBeenCalledWith(messageBody);

            esClient.update.and.returnValue(Promise.resolve({ result: 'not-created' }));

            await service.handleEnqueuedMessage(message);

            expect(wsServer.sendDataProductUpdate).toHaveBeenCalledTimes(1);

            await service.handleEnqueuedMessage(null);

            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledTimes(2);
            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledTimes(2);
            expect(wsServer.sendDataProductUpdate).toHaveBeenCalledTimes(1);
        });
    });
});
