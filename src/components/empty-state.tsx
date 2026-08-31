import { CardContent } from "./ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
};

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
        <span className="font-display text-lg font-bold">@</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  );
}

export { EmptyState };
