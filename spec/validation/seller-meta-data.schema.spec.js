const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Validation - Seller meta data', function() {

    const VALID_METADATA = {
        category: ['Industrial'],
        fullDescription: 'fullDescription',
        maxNumberOfDownloads: 20,
        name: 'name',
        shortDescription: 'shortDescription',
        size: 1500,
        title: 'title',
        type: 'type',
        eula: {
            type: 'STANDARD',
            fileHash: 'hash',
            fileName: 'name.txt'
        },
        sampleFile: [
            { title: 'sample 1', fileHash: 'sample-hash-1', fileName: 'dupa.txt' },
            { title: 'sample 2', fileHash: 'sample-hash-2', fileName: 'file.mkv' },
        ]
    };

    afterEach(function () {
        mock.stopAll();
    });

    function mockCategories() {
        const Categories = { pathExists: jasmine.createSpy('Categories.pathExists').and.returnValue(true) };

        mock(DIST_DIR + 'utils/categories', { Categories });

        return Categories;
    }

    function requireSchema() {
        return mock.reRequire(DIST_DIR + 'validation/seller-meta-data.schema').SellerMetaDataSchema;
    }

    it('should pass valid meta data', () => {

        mockCategories();
        const schema = requireSchema();

        let result = schema.validate(VALID_METADATA);
        expect(result.error).toBeFalsy();
    });

    it('should validate fullDescription', () => {

        mockCategories();
        const schema = requireSchema();

        const meta = Object.assign({}, VALID_METADATA);

        meta.fullDescription = '';

        let result = schema.validate(meta);
        expect(result.error).toBeFalsy();

        delete meta.fullDescription;

        result = schema.validate(meta);
        expect(result.error).toBeFalsy();
    });

    it('should validate shortDescription', () => {

        mockCategories();
        const schema = requireSchema();

        const meta = Object.assign({}, VALID_METADATA);

        delete meta.shortDescription;

        let result = schema.validate(meta);
        expect(result.error).toBeTruthy();
    });

    it('should validate category', async () => {

        const Categories = mockCategories();
        const schema = requireSchema();

        Categories.pathExists.and.returnValue(false);
        result = schema.validate(VALID_METADATA);
        expect(result.error.toString()).toContain('category');
    });

    it('should validate eula', async () => {

        mockCategories();
        const schema = requireSchema();

        const dataSets = [
            { expectedToBeValid: true, data: { type: 'STANDARD', fileHash: 'hash', fileName: 'file.mkv' } },
            { expectedToBeValid: true, data: { type: 'RESTRICTIVE', fileHash: 'hash', fileName: 'file.mkv' } },
            { expectedToBeValid: true, data: { type: 'OWNER', fileHash: 'hash', fileName: 'file.mkv' } },
            { expectedToBeValid: false, data: { type: 'OWNER' } },
            { expectedToBeValid: false, data: { type: 'INVALID', fileHash: 'hash', fileName: 'file.mkv' } },
            { expectedToBeValid: false, data: { fileHash: 'hash', fileName: 'file.mkv' } },
        ];

        let result, meta = Object.assign({}, VALID_METADATA);

        for (set of dataSets) {
            meta.eula = set.data;
            result = schema.validate(meta);

            if (set.expectedToBeValid) {
                expect(result.error).toBeFalsy();
            } else {
                expect(result.error.toString()).toContain('eula');
            }
        }
    });

    it('should validate sampleFile', async () => {

        mockCategories();
        const schema = requireSchema();

        const dataSets = [
            { data: [{ title: 'ok', fileHash: 'hash', fileName: 'file.mkv' }, { title: 'ok2', fileHash: 'hash2', fileName: 'file.mkv' }], expectedToBeValid: true },
            { data: [{ title: 'ok', fileHash: 'hash' }, { title: null, fileHash: 'hash2' }], expectedToBeValid: false },
            { data: [{ title: 2, fileHash: 'hash' }], expectedToBeValid: false },
            { data: [{ title: 'ok', fileHash: 2, fileName: 'file.mkv' }], expectedToBeValid: false },
            { data: [{ fileHash: 'hash', fileName: 'file.mkv' }], expectedToBeValid: false },
            { data: [{ title: 'title' }], expectedToBeValid: false },
        ];

        let result, meta = Object.assign({}, VALID_METADATA);

        for (set of dataSets) {
            meta.sampleFile = set.data;
            result = schema.validate(meta);

            if (set.expectedToBeValid) {
                expect(result.error).toBeFalsy();
            } else {
                expect(result.error.toString()).toContain('sampleFile');
            }
        }
    });
});
