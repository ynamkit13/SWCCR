type MuteButtonProps = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={muted ? "Unmute" : "Mute"}
      className="bg-black/50 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
