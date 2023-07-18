function unknownObjectValidator(props, propName, componentName) {
  if (props[propName] !== null && typeof props[propName] !== 'object') {
    return new Error(
      `Invalid prop '${propName}' supplied to '${componentName}'.` +
        ` Expected an object or null, but received '${typeof props[
          propName
        ]}'.`,
    );
  }
  return null;
}

export { unknownObjectValidator };
