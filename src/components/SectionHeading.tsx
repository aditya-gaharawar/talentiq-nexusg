interface SectionHeadingProps {
  badge?: string;
  title: string;
  gradientText?: string;
  subtitle?: string;
}

const SectionHeading = ({ badge, title, gradientText, subtitle }: SectionHeadingProps) => (
  <div className="text-center mb-16">
    {badge && (
      <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase glass glow-border mb-6 text-accent">
        {badge}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
      {title}{" "}
      {gradientText && <span className="gradient-text">{gradientText}</span>}
    </h2>
    {subtitle && (
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
    )}
  </div>
);

export default SectionHeading;
