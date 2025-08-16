import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

interface ConfigPopupProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (serverUrl: string, apiKey: string, apiSecret: string) => void;
  initialServerUrl: string;
  initialApiKey: string;
  initialApiSecret: string;
}

const ConfigPopup: React.FC<ConfigPopupProps> = ({
  visible,
  onDismiss,
  onSave,
  initialServerUrl,
  initialApiKey,
  initialApiSecret,
}) => {
  const [serverUrl, setServerUrl] = React.useState(initialServerUrl);
  const [apiKey, setApiKey] = React.useState(initialApiKey);
  const [apiSecret, setApiSecret] = React.useState(initialApiSecret);

  const handleSave = () => {
    onSave(serverUrl, apiKey, apiSecret);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Configuration</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="API Key"
            value={apiKey}
            onChangeText={setApiKey}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="API Secret"
            value={apiSecret}
            onChangeText={setApiSecret}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});

export default ConfigPopup;
