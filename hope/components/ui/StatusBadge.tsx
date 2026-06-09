import type { MissionStatus } from "@/lib/domain/types";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/domain/labels";
import { Badge, Dot } from "./Badge";

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <Dot tone={STATUS_TONE[status]} />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
