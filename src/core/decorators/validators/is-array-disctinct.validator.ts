import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsArrayDistinctConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    const uniqueValues = new Set(value);
    return uniqueValues.size === value.length;
  }

  defaultMessage(): string {
    return 'Array must contain distinct values';
  }
}

export function IsArrayDistinct(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayDistinctConstraint,
    });
  };
}
