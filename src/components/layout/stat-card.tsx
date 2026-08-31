import { Card, CardContent } from "../ui/card";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function StatCard({ label, value, detail, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <strong className={`mt-4 block font-display text-2xl font-semibold text-foreground ${valueClassName || ""}`}>{value}</strong>
        <small className="mt-2 block text-xs text-muted-foreground">{detail}</small>
      </CardContent>
    </Card>
  );
}

export { StatCard };
