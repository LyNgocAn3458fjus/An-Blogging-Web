import { useState } from "react";

const InputBox = ({ name, type, placeholder, defaultValue, id, icon }) => {
  const [passWordVisible, setPassWordVisible] = useState(false);

  return (
    <div className="relative w-full mb-4">
      {/* Input */}
      <input
        name={name}
        type={type === "password" ? (passWordVisible ? "text" : "password") : type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        id={id}
        className="
          w-full
          py-3
          pl-12
          pr-12
          rounded-xl
          border border-gray-300
          bg-gray-50/80 backdrop-blur-sm
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-black/20
          transition
        "
      />

      {/* Left icon */}
      {icon && (
        <i className={`fi ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none`}></i>
      )}

      {/* Password toggle icon */}
      {type === "password" && (
        <i
          className={`fi fi-rr-eye${!passWordVisible ? "-crossed" : ""} absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-black transition`}
          onClick={() => setPassWordVisible((current) => !current)}
        ></i>
      )}
    </div>
  );
};

export default InputBox;
