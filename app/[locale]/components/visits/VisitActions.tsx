"use client";

import { deleteVisitAction } from "@/app/[locale]/(dashboard)/visits/actions";
import { ActionButton } from "@/shared/ui/ActionButton";

type VisitActionsProps = {
  visitId: number;
};

export function VisitActions({ visitId }: VisitActionsProps) {
  return (
    <form action={deleteVisitAction.bind(null, visitId)}>
      <ActionButton tone="danger">Smazat</ActionButton>
    </form>
  );
}
