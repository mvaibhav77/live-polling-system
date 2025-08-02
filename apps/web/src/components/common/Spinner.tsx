interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-background border-t-accent",
    secondary: "border-gray-200 border-t-gray-600",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
    />
  );
};

export default Spinner;
