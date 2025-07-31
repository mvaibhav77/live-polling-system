type ButtonProps = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={`py-4 px-16 cursor-pointer rounded-full transition-colors focus:outline-none bg-primary text-white hover:bg-primary/90 ${props.className}`}
    >
      {props.text}
    </button>
  );
};

export default Button;
