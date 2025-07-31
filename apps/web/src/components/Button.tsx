type ButtonProps = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const Button = (props: ButtonProps) => {
  return (
    <button
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`py-4 px-16 rounded-full transition-colors focus:outline-none bg-primary text-white hover:bg-primary/90 ${props.className} ${props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {props.text}
    </button>
  );
};

export default Button;
