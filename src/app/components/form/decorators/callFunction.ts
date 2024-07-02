export function callFunction(
  methodName: string,
  descriptor?: TypedPropertyDescriptor<any>
): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor?: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor?.value;
    if (originalMethod) {
      descriptor.value = function (...args: any[]) {
        const result = originalMethod.apply(this, args);
        (this as any)[methodName]();
        return result;
      };
    }
    return descriptor;
  };
}
