type Props = {
  message: string;
};

export const ErrorMessage: React.FC<Props> = ({ message }) => {
  return (
    <div className="my-8 flex items-center justify-center lg:my-16">
      <span className="rounded-sm border border-red-500/50 bg-red-500/10 px-4 py-2 text-red-500">
        {" "}
        {message}
      </span>
    </div>
  );
};
