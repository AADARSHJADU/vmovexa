import React, { useState, useRef, useEffect } from 'react';

export const OtpInput = ({ length = 6, value = '', onChange, onComplete }) => {
  const [otp, setOtp] = useState(() => {
    if (value && typeof value === 'string') {
      const arr = value.split('').slice(0, length);
      while (arr.length < length) arr.push('');
      return arr;
    }
    return new Array(length).fill('');
  });
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value !== undefined && typeof value === 'string') {
      const arr = value.split('').slice(0, length);
      while (arr.length < length) arr.push('');
      setOtp(arr);
    }
  }, [value, length]);

  const triggerChange = (newOtpArr) => {
    const code = newOtpArr.join('');
    if (onChange) onChange(code);
    if (code.length === length && onComplete) {
      onComplete(code);
    }
  };

  const handleChange = (e, index) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      triggerChange(newOtp);
      return;
    }

    if (digits.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && index + i < length; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      triggerChange(newOtp);
      const nextIdx = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[nextIdx]) {
        inputRefs.current[nextIdx].focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits.slice(-1);
    setOtp(newOtp);
    triggerChange(newOtp);

    // Move to next input if current field is filled
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        triggerChange(newOtp);
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        triggerChange(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    triggerChange(newOtp);

    const targetIndex = Math.min(pasted.length, length - 1);
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          ref={(el) => (inputRefs.current[index] = el)}
          value={data}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 rounded-xl border border-[#2a2a2a] bg-[#121212] text-center text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
        />
      ))}
    </div>
  );
};
