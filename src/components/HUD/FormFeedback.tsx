type FormFeedbackProps = {
  message: string | null;
};

export function FormFeedback({ message }: FormFeedbackProps) {
  if (!message) return null;

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 animate-pulse">
      <p className="text-white text-sm font-medium text-center">{message}</p>
    </div>
  );
}
