const Joi = require('joi');
import {Categories} from "../utils/categories";

export const EULA_TYPES = ['STANDARD', 'RESTRICTIVE', 'OWNER'];

const joiCategoryValidator = Joi.extend((joi: any) => ({
    base: joi.array(),
    name: 'category',
    language: {
        validCategory: 'needs to be a valid category path'
    },
    rules: [
        {
            name: 'validCategory',
            validate(params: any, value: any, state: any, options: any) {
                for (let path of value) {
                    if (!Categories.pathExists(path)) {
                        return this.createError('category.validCategory', {v: path}, state, options);
                    }
                }

                return value;
            }
        },
    ]
}));

export const SellerMetaDataSchema = Joi.object()
    .keys({
        category: joiCategoryValidator.category().validCategory().required(),
        eula: Joi
            .object({
                type: Joi.string().valid(EULA_TYPES).required(),
                fileHash: Joi.string().required(),
                fileName: Joi.string().required(),
            })
            .required(),
        title: Joi.string().required(),
        shortDescription: Joi.string().required(),
        fullDescription: Joi.string().empty(''),
        type: Joi.string().required(),
        maxNumberOfDownloads: Joi.number(),
        name: Joi.string().required(),
        size: Joi.number().required(),
        sampleFile: Joi.array().items(Joi
            .object({
                title: Joi.string().required(),
                fileHash: Joi.string().required(),
                fileName: Joi.string().required(),
            })
        )
    })
    .unknown(true);
