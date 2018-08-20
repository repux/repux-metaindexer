const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Utility - Categories', () => {
    it('should check whether  specified category exist', () => {
        const Categories = mock.reRequire(DIST_DIR + 'utils/categories').Categories;

        expect(Categories.pathExists('Industrial')).toBe(true);
        expect(Categories.pathExists('Category X')).toBe(false);
        expect(Categories.pathExists('')).toBe(false);
        expect(Categories.pathExists('Industrial > Invalid subcategory')).toBe(false);
    });
});
