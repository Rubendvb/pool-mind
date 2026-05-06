interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: Props) {
  return (
    <header className="flex items-start justify-between px-4 pt-8 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-ocean-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </header>
  );
}
