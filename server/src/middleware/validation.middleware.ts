import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/ApiError.util';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(', ');

      return next(new ValidationError(errorMessages));
    }

    next();
  };
};
