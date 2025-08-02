import type { ReactNode } from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const Button = ({ variant = "primary", ...props }: ButtonProps) => {
  const baseClasses = "transition-colors font-bold focus:outline-none";
  const disabledClasses = props.disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const variantClasses = {
    primary:
      "bg-primary py-4 px-16 rounded-full text-white hover:bg-primary/90",
    secondary:
      "py-3 px-10 border-2 border-primary rounded-xl text-primary bg-transparent hover:bg-primary hover:text-white",
  };

  return (
    <button
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${props.className}`}
    >
      {props.children}
    </button>
  );
};

export default Button;
