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

    describe('handleEnqueuedEvent', () => {
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
            const wsNotifier = {
                notify: jasmine.createSpy('wsNotifier.notify')
            };
            const web3 = {
                eth: {
                    getCode: () => '0x123'
                }
            };

            const DataProductEventHandler = require(DIST_DIR + 'services/data-product-event-handler').DataProductEventHandler;

            const service = new DataProductEventHandler(
                esClient,
                'test',
                logger,
                dataProductContractFactory,
                dataProductUpdater,
                ratingsUpdater,
                wsNotifier,
                web3
            );

            const event = { transactionHash: 'hash', args: { action: 1 }, blockNumber: 234 };

            await service.handleEnqueuedEvent(event);

            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledTimes(1);
            expect(dataProductUpdater.handleDataProductUpdate).toHaveBeenCalledWith(
                dataProductContract,
                event.blockNumber,
                event.args.action
            );

            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledTimes(1);
            expect(ratingsUpdater.recalculateRatingsForUser).toHaveBeenCalledWith('owner-address');

            expect(wsNotifier.notify).toHaveBeenCalledTimes(1);
            expect(wsNotifier.notify).toHaveBeenCalledWith(event);

            esClient.update.and.returnValue(Promise.resolve({ result: 'not-created' }));

            await service.handleEnqueuedEvent(event);

            expect(wsNotifier.notify).toHaveBeenCalledTimes(1);
        });
    });
});
