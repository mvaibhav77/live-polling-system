import aiIcon from "../../assets/ai.svg";

type Props = {
  className?: string;
};

const Pill: React.FC<Props> = (props: Props) => {
  return (
    <div
      className={`bg-gradient-to-r from-primary to-accent w-fit text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 ${props.className}`}
    >
      <img src={aiIcon} alt="AI" className="w-3 h-3" />
      Intervue Poll
    </div>
  );
};

export default Pill;
