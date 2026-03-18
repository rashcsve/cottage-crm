"use client";

import { deleteVisitAction } from "@/app/(dashboard)/visits/actions";
import { ActionButton } from "../ui/ActionsButton";

type VisitActionsProps = {
  visitId: number;
};

export function VisitActions({ visitId }: VisitActionsProps) {
  return (
    <form action={deleteVisitAction.bind(null, visitId)}>
      <ActionButton variant="danger">Smazat</ActionButton>
    </form>
  );
}
