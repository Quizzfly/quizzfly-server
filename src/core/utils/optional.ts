export class Optional<T extends object = any> {
  private readonly instance: T;

  constructor(instance: T) {
    this.instance = instance;
  }

  static of(instance: any) {
    return new Optional(instance);
  }

  throwIfPresent(exception: any) {
    if (
      (Array.isArray(this.instance) && this.instance[0]) ||
      (!Array.isArray(this.instance) && this.instance)
    ) {
      throw exception;
    }

    return this;
  }

  throwIfNotPresent(exception: any) {
    if (
      (Array.isArray(this.instance) && !this.instance[0]) ||
      (!Array.isArray(this.instance) && !this.instance)
    ) {
      throw exception;
    }

    return this;
  }

  throwIfNullable(exception: any) {
    if (this.instance === null) {
      throw exception;
    }

    return this;
  }

  throwIfExist(exception: any) {
    if ((Array.isArray(this.instance) && this.instance[0]) || this.instance) {
      throw exception;
    }

    return this;
  }

  isPresent() {
    if (Array.isArray(this.instance)) {
      return Boolean(this.instance[0]);
    }

    return Boolean(this.instance);
  }

  get<K extends object = any>() {
    if (!this.instance) throw new Error('Should call throwIfNullable first');

    return this.instance as unknown as K;
  }
}
