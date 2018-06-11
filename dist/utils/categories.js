"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('./../../config/config');
class Categories {
    static tree() {
        if (typeof Categories.categories === 'undefined') {
            Categories.categories = require('../../config/categories.json');
        }
        return Categories.categories;
    }
    static pathExists(path) {
        let foundCategory, currentCategories = Categories.tree();
        return path.split(config.categorySeparator).map(str => str.trim()).reduce((pathFound, pathPart) => {
            if (!pathFound) {
                return false;
            }
            foundCategory = currentCategories.reduce((result, category) => {
                return category.name === pathPart ? category : result;
            }, false);
            if (foundCategory) {
                currentCategories = foundCategory.subcategories || [];
                return true;
            }
            return false;
        }, true);
    }
}
exports.Categories = Categories;
module.exports.Categories = Categories;
