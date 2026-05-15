"use client";

import { useId, useLayoutEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Modal } from "@/components/atoms/modal";

function ConfirmNameMatchInput({
  id,
  confirmNameMatch,
  disabled,
  onValidityChange,
}: {
  id: string;
  confirmNameMatch: string;
  disabled: boolean;
  onValidityChange: (ok: boolean) => void;
}) {
  const [value, setValue] = useState("");

  useLayoutEffect(() => {
    onValidityChange(false);
    // Intentionally once per mount so a new keyed field always clears the parent gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onValidityChange is stable (setState)
  }, []);

  return (
    <div className="mt-4 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-foreground">
        Type <span className="font-mono text-foreground">{confirmNameMatch}</span> to confirm
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          onValidityChange(next.trim() === confirmNameMatch);
        }}
        disabled={disabled}
        className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-primary/25 transition focus:border-primary/50 focus:ring-2 disabled:opacity-60"
        placeholder={confirmNameMatch}
      />
    </div>
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  /** When true, primary action uses the danger button style. */
  destructive?: boolean;
  pending?: boolean;
  /**
   * When set, the user must type this exact string (after trim) before confirm is enabled.
   * Used for high-risk destructive actions (e.g. delete role by name).
   */
  confirmNameMatch?: string;
  /** Changes reset the name-confirmation field without effects (e.g. role id being deleted). */
  confirmFieldKey?: string;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  pending = false,
  confirmNameMatch,
  confirmFieldKey,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const matchInputId = useId();
  const [nameMatchOk, setNameMatchOk] = useState(false);

  const matchSatisfied = !confirmNameMatch || nameMatchOk;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      presenceKey="confirm-dialog"
      variant="center"
      size="md"
      zClass="z-dialog"
      overlayClassName="bg-black/55"
      closeDisabled={pending}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            className="min-w-[96px]"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "danger" : "primary"}
            className="min-w-[96px]"
            disabled={pending || !matchSatisfied}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {pending ? "Please wait…" : confirmLabel}
          </Button>
        </>
      }
    >
      <h2 id={titleId} className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      {description ? (
        <p id={descId} className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {open && confirmNameMatch ? (
        <ConfirmNameMatchInput
          key={confirmFieldKey ?? "confirm-name"}
          id={matchInputId}
          confirmNameMatch={confirmNameMatch}
          disabled={pending}
          onValidityChange={setNameMatchOk}
        />
      ) : null}
    </Modal>
  );
}
