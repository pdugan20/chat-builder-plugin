export interface UpdateKeyDialogProps {
  dialogTitle: string;
  dialogDescription?: string;
  actionLabel?: string;
  anthropicKey: string;
  keyLength?: number;
}

export interface HandleInputChangeProps {
  updatedKey: string;
}
