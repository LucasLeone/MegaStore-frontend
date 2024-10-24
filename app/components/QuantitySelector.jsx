// components/QuantitySelector.jsx
import React from 'react';
import { Button } from '@nextui-org/react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import QuantityInput from './QuantityInput';

const QuantitySelector = ({ quantity, onDecrement, onIncrement, onChange, disabled }) => {
  return (
    <div className="flex items-center border border-gray-300 w-fit rounded-md">
      {/* Botón Decrementar */}
      <Button
        onClick={onDecrement}
        isDisabled={disabled || quantity <= 1}
        aria-label="Decrementar cantidad"
        className="p-2 rounded-none"
        isIconOnly
        variant="light"
      >
        <IconMinus size={16} />
      </Button>

      {/* Texto de cantidad */}
      <p className='ps-2 pe-2'>
        {quantity}
      </p>

      {/* Botón Incrementar */}
      <Button
        onClick={onIncrement}
        isDisabled={disabled}
        aria-label="Incrementar cantidad"
        className="p-2 rounded-none"
        isIconOnly
        variant="light"
      >
        <IconPlus size={16} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
