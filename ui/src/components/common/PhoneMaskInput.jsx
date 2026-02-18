import React from 'react';
import PropTypes from 'prop-types';
import { IMaskInput } from 'react-imask';

const PhoneMaskInput = React.forwardRef(function PhoneMaskInput(props, ref) {
  const { onChange, name, ...other } = props;

  return (
    <IMaskInput
      {...other}
      mask="(#00) 000-0000"
      definitions={{ '#': /[1-9]/ }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name, value } })}
      overwrite
    />
  );
});

PhoneMaskInput.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PhoneMaskInput;
