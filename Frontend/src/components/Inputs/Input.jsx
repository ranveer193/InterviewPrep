import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  // const isPasswordType = type === "password";
  // const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
     
        <label className="text-[13px] text-slate-800 mb-1">{label}</label>
    
      <div className="input-box">
        <input
          type={
            type=="password"?(showPassword?"text":"password"):type
          }
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={(e) => onChange(e)}
        />
        {type==="password" && (

          <>
           {showPassword?(
            <FaRegEye
            size={22}
            className="text-[#4F46E5] cursor-pointer"
            onClick={()=>toggleShowPassword()}
            />
           ):(
            <FaRegEyeSlash
             size={22}
             className="text-slate-400 cursor-pointer "
             onClick={()=>toggleShowPassword()}
             />
           )

           }
          
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
