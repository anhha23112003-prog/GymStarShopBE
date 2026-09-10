import React, { useState } from "react";

const InputCustom = ({
  labelContent,
  id,
  name,
  placeholder,
  typeInput = "text",
  classWrapper,
  onChange,
  onBlur,
  value,
  error,
  touched,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Debug để kiểm tra giá trị disabled
  console.log(`InputCustom - ${name}: disabled = ${disabled}`);

  return (
    <div className={classWrapper || "mb-4"}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {labelContent}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={typeInput}
          placeholder={placeholder}
          className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm ${
            disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : ""
          } ${error && touched ? "border-red-500" : ""}`}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          disabled={disabled}
        />
        {typeInput === "password" && (
          <span
            onClick={handleTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
          ></span>
        )}
      </div>
      {error && touched && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputCustom;
