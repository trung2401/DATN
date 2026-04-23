const Button = ({
  text,
  onClick,
  icon = null,
  iconPosition = "left",
  variant = "default",
  size = "md",
  className = "",
  bg,
  border,
  textColor,
  textSize = "text-base",
  hoverBg,
  type = "button",
  disabled = false,
}) => {
  const defaultVariantClasses = {
    primary: {
      bg: "bg-[#2C99E2]",
      text: "text-white",
      border: "border border-[#2C99E2]",
      hover: "hover:bg-[#2C99E2]/80",
    },
    default: {
      bg: "bg-white",
      text: "text-[#49719C]",
      border: "border border-[#49719C]",
      hover: "hover:bg-gray-100",
    },
    delete: {
      bg: "bg-red-500",
      text: "text-white",
      border: "border border-red-500",
      hover: "hover:bg-red-100",
    },
  };

  const sizeClasses = {
    sm: "px-4 py-1.5",
    md: "px-10 py-2.5",
    lg: "w-full px-5 py-2.5",
  };

  const current = defaultVariantClasses[variant];
  const bgClass = bg ? bg : current.bg;
  const borderClass = border ? border : current.border;
  const textClass = textColor ? textColor : current.text;
  const hoverClass = disabled ? "" : hoverBg ? hoverBg : current.hover;
  const disabledClass = disabled
    ? "disabled:cursor-not-allowed"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer justify-center rounded-md font-semibold transition duration-200
        ${bgClass} ${textClass} ${borderClass} ${hoverClass} ${sizeClasses[size]} ${textSize} ${disabledClass} ${className}`}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && (
        <span className="flex items-center mr-2">{icon}</span>
      )}
      {text && <span>{text}</span>}
      {icon && iconPosition === "right" && (
        <span className="flex items-center ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
