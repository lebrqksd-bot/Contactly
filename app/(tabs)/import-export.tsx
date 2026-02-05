import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Button, Card, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useContacts } from '@/hooks/useContacts';
import { csvUtils } from '@/utils/csv';
import { xlsxUtils } from '@/utils/xlsx';
import { vcardUtils } from '@/utils/vcard';
import { EmptyState } from '@/components/ui/EmptyState';
import * as XLSX from 'xlsx';
import { theme } from '@/theme';

export default function ImportExportScreen() {
  const router = useRouter();
  const { contacts, createContact } = useContacts();
  const [mode, setMode] = useState<'import' | 'export'>('import');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample CSV content for download
  const sampleCSV = `name,phone,email,company,address,notes,categories
John Smith,+1-555-123-4567,john.smith@email.com,Acme Corporation,123 Main Street City State 12345,Important client,business;client
Jane Doe,+1-555-987-6543,jane.doe@email.com,Tech Solutions,456 Oak Avenue City State 67890,Project manager,business;colleague
Michael Johnson,+1-555-456-7890,michael.j@gmail.com,Freelancer,789 Pine Road City State 11111,Met at networking event,personal;networking`;

  const handleDownloadSampleCSV = () => {
    if (Platform.OS === 'web') {
      const blob = new Blob([sampleCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sample_contacts.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Sample CSV Format', 
        'CSV should have these columns:\nname, phone, email, company, address, notes, categories\n\nMultiple categories can be separated by semicolons (;)');
    }
  };

  const handleWebFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setImporting(true);
        const content = e.target?.result as string;
        const importedContacts = csvUtils.importFromCSV(content);

        if (importedContacts.length === 0) {
          Alert.alert('Error', 'No contacts found in CSV file. Make sure your CSV has a "name" column.');
          return;
        }

        let successCount = 0;
        for (const contact of importedContacts) {
          try {
            await createContact(contact);
            successCount++;
          } catch (error) {
            console.error('Error importing contact:', error);
          }
        }

        Alert.alert('Success', `Imported ${successCount} of ${importedContacts.length} contacts`);
      } catch (error) {
        console.error('CSV import error:', error);
        Alert.alert('Error', 'Failed to import CSV file. Please check the file format.');
      } finally {
        setImporting(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    // For web, use file input
    if (Platform.OS === 'web') {
      if (!fileInputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,text/csv';
        input.style.display = 'none';
        input.onchange = handleWebFileSelect;
        document.body.appendChild(input);
        fileInputRef.current = input;
      }
      fileInputRef.current.click();
      return;
    }

    // For native platforms
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importedContacts = csvUtils.importFromCSV(fileContent);

      if (importedContacts.length === 0) {
        Alert.alert('Error', 'No contacts found in CSV file');
        return;
      }

      let successCount = 0;
      for (const contact of importedContacts) {
        try {
          await createContact(contact);
          successCount++;
        } catch (error) {
          console.error('Error importing contact:', error);
        }
      }

      Alert.alert('Success', `Imported ${successCount} of ${importedContacts.length} contacts`);
    } catch (error) {
      Alert.alert('Error', 'Failed to import CSV file');
    }
  };

  const handleImportXLSX = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      
      // Read file as base64
      let fileContent: string;
      try {
        fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        // Fallback: try reading as binary on web
        if (Platform.OS === 'web') {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          throw e;
        }
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = bytes.buffer;

      const importedContacts = xlsxUtils.importFromXLSX(buffer);

      if (importedContacts.length === 0) {
        Alert.alert('Error', 'No contacts found in Excel file');
        return;
      }

      let successCount = 0;
      for (const contact of importedContacts) {
        try {
          await createContact(contact);
          successCount++;
        } catch (error) {
          console.error('Error importing contact:', error);
        }
      }

      Alert.alert('Success', `Imported ${successCount} of ${importedContacts.length} contacts`);
    } catch (error) {
      console.error('XLSX import error:', error);
      Alert.alert('Error', 'Failed to import Excel file. Please check the file format.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = csvUtils.exportToCSV(contacts);
      const fileUri = `${FileSystem.cacheDirectory}contacts_${Date.now()}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Contacts',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const handleExportXLSX = async () => {
    try {
      const workbook = xlsxUtils.exportToXLSX(contacts);
      const fileUri = `${FileSystem.cacheDirectory}contacts_${Date.now()}.xlsx`;

      // Convert workbook to base64
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      
      if (Platform.OS === 'web') {
        // On web, trigger download
        const link = document.createElement('a');
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
        link.download = `contacts_${Date.now()}.xlsx`;
        link.click();
      } else {
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Export Contacts',
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('XLSX export error:', error);
      Alert.alert('Error', 'Failed to export Excel file');
    }
  };

  const handleExportVCard = async () => {
    try {
      const vcardContent = vcardUtils.generateMultiple(contacts);
      const fileUri = `${FileSystem.cacheDirectory}contacts_${Date.now()}.vcf`;

      await FileSystem.writeAsStringAsync(fileUri, vcardContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/vcard',
          dialogTitle: 'Export Contacts',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export vCard');
    }
  };

  const handleSyncDeviceContacts = async () => {
    try {
      // Navigate to selection screen instead of auto-sync
      router.push('/device-import');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open device contacts');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as 'import' | 'export')}
          buttons={[
            { value: 'import', label: 'Import' },
            { value: 'export', label: 'Export' },
          ]}
          style={styles.segmentedButtons}
        />

        {mode === 'import' && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Import Contacts
            </Text>

            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Sync Device Contacts
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Import contacts from your device address book
                </Text>
                <Button
                  mode="contained"
                  onPress={handleSyncDeviceContacts}
                  style={styles.button}
                >
                  Select & Import Contacts
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Import from CSV
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Import contacts from a CSV file. Required column: name. Optional: phone, email, company, address, notes, categories
                </Text>
                <View style={styles.buttonRow}>
                  <Button
                    mode="contained"
                    onPress={handleImportCSV}
                    style={styles.buttonFlex}
                    loading={importing}
                    disabled={importing}
                    icon="file-upload"
                  >
                    {importing ? 'Importing...' : 'Choose CSV File'}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleDownloadSampleCSV}
                    style={styles.buttonFlex}
                    icon="download"
                  >
                    Sample CSV
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Import from Excel (XLSX)
                </Text>
                <Text variant="bodyMedium" style={styles.cardDescription}>
                  Import contacts from an Excel file with the same column format
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleImportXLSX}
                  style={styles.button}
                >
                  Choose Excel File
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        {mode === 'export' && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Export Contacts
            </Text>

            {contacts.length === 0 ? (
              <EmptyState
                title="No contacts to export"
                message="Add some contacts first"
              />
            ) : (
              <>
                <Card style={styles.card}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Export as CSV
                    </Text>
                    <Text variant="bodyMedium" style={styles.cardDescription}>
                      Export all contacts as a CSV file
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handleExportCSV}
                      style={styles.button}
                    >
                      Export CSV ({contacts.length} contacts)
                    </Button>
                  </Card.Content>
                </Card>

                <Card style={styles.card}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Export as Excel (XLSX)
                    </Text>
                    <Text variant="bodyMedium" style={styles.cardDescription}>
                      Export all contacts as an Excel file
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handleExportXLSX}
                      style={styles.button}
                    >
                      Export Excel ({contacts.length} contacts)
                    </Button>
                  </Card.Content>
                </Card>

                <Card style={styles.card}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      Export as vCard
                    </Text>
                    <Text variant="bodyMedium" style={styles.cardDescription}>
                      Export all contacts as a vCard file
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={handleExportVCard}
                      style={styles.button}
                    >
                      Export vCard ({contacts.length} contacts)
                    </Button>
                  </Card.Content>
                </Card>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.background.elevated,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  cardDescription: {
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonFlex: {
    flex: 1,
  },
});

