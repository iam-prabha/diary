import { ValidationError } from '../lib/errors.js';
export const validate = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return next(new ValidationError(result.error.flatten()));
        }
        req.body = result.data;
        next();
    };
};
// Express 5 makes req.query read-only; store parsed values on the request instead.
export const validateQuery = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            return next(new ValidationError(result.error.flatten()));
        }
        ;
        req.validatedQuery = result.data;
        next();
    };
};
//# sourceMappingURL=validate.js.map