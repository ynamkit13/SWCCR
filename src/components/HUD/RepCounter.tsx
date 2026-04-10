type RepCounterProps = {
  current: number;
  target: number;
};

export function RepCounter({ current, target }: RepCounterProps) {
  const remaining = target - current;
  const isComplete = current >= target;

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
      <p className="text-5xl font-bold text-white">{current}</p>
      <p className="text-white/60 text-sm">/ {target}</p>
      <p className="text-sm font-medium mt-1 text-primary">
        {isComplete ? "Set complete!" : `${remaining} more to go!`}
      </p>
    </div>
  );
}
