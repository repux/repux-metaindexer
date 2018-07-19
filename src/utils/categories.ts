const config = require('./../../config/config');

export class Categories {
    private static categories: Array<any>;

    public static tree(): Array<any> {
        if (typeof Categories.categories === 'undefined') {
            Categories.categories = require('../../config/categories.json');
        }

        return Categories.categories;
    }

    public static pathExists(path: string): boolean {
        let foundCategory, currentCategories = Categories.tree();

        return path.split(config.categorySeparator).map(str => str.trim()).reduce(
            (pathFound: boolean, pathPart: string) => {
                if (!pathFound) {
                    return false;
                }

                foundCategory = currentCategories.reduce(
                    (result: any, category: any) => {
                        return category.name === pathPart ? category : result;
                    },
                    false
                );

                if (foundCategory) {
                    currentCategories = foundCategory.subcategories || [];

                    return true;
                }

                return false;
            },
            true
        );
    }
}

module.exports.Categories = Categories;
