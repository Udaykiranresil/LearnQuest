const VARIANTS = {
  primary:
    "bg-[var(--color-brass)] text-[var(--color-void)] hover:bg-[var(--color-brass-bright)] border border-[var(--color-brass)]",
  secondary:
    "bg-transparent text-[var(--color-parchment)] border border-[var(--color-panel-line)] hover:border-[var(--color-brass)] hover:text-[var(--color-brass-bright)]",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-parchment)] border border-transparent",
  danger:
    "bg-transparent text-[var(--color-oxblood-bright)] border border-[var(--color-oxblood)] hover:bg-[var(--color-oxblood)] hover:text-[var(--color-parchment)]",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  const sizeCls =
    size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-sm" : "px-4 py-2 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${sizeCls} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={16} strokeWidth={1.75} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={16} strokeWidth={1.75} />}
    </button>
  );
}
