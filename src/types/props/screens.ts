export interface SettingsScreenProps {
  anthropicKey: string;
  screen?: string;
  pluginVersion?: string;
}

export interface PluginScreenProps {
  anthropicKey: string;
  screen?: string;
  defaultStyle?: string;
  defaultParticipants?: string;
  defaultMaxMessages?: string;
  formVisibility?: string;
  useTestData?: boolean;
}
