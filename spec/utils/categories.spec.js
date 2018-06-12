const DIST_DIR = './../../dist/';

const mock = require('mock-require');

describe('Utility - Categories', function () {
    it('should check whether  specified category exist', function () {
        const Categories = mock.reRequire(DIST_DIR + 'utils/categories').Categories;

        expect(Categories.pathExists('Category 1')).toBe(true);
        expect(Categories.pathExists('Category 1 > Subcategory 1 > Sub-Subcategory1')).toBe(true);
        expect(Categories.pathExists('Category X')).toBe(false);
        expect(Categories.pathExists('')).toBe(false);
        expect(Categories.pathExists('Category 1 > Invalid subcategory')).toBe(false);
    });
});
