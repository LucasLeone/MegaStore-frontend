import React, { forwardRef } from 'react';
import { useInput } from '@nextui-org/react';

const QuantityInput = forwardRef((props, ref) => {
  const { getInputProps } = useInput({
    ...props,
    ref,
    classNames: {
      input: "bg-transparent",
    },
  });

  return <input {...getInputProps()} />;
});

QuantityInput.displayName = 'QuantityInput';

export default QuantityInput;
