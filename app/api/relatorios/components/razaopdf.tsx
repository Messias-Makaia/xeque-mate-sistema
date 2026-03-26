import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, pb: 5 },
  title: { fontSize: 16, fontWeight: 'bold', uppercase: true },
  row: { flexDirection: 'row', borderBottom: 0.5, borderBottomColor: '#EEE', py: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F0F0F0', fontWeight: 'bold', py: 4 },
  colData: { width: '15%' },
  colDesc: { width: '40%' },
  colVal: { width: '15%', textAlign: 'right' },
  footer: { marginTop: 20, fontSize: 8, color: 'gray', borderTop: 0.5, pt: 5, flexDirection: 'row', justifyContent: 'space-between' }
});

export const RazaoPDF = ({ dados, params }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Razão Xeque-Mate</Text>
        <Text>Conta: {dados.codigoConta} - {dados.nomeConta}</Text>
        <Text>Período: {params.dataInicio} a {params.dataFim}</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.colData}>Data</Text>
        <Text style={styles.colDesc}>Descrição</Text>
        <Text style={styles.colVal}>Débito</Text>
        <Text style={styles.colVal}>Crédito</Text>
        <Text style={styles.colVal}>Saldo</Text>
      </View>

      {dados?.razao1?.map((mov: any, i: number) => (
        <View key={i} style={styles.row}>
          <Text style={styles.colData}>{new Date(mov.data).toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.colDesc}>{mov.descricao}</Text>
          <Text style={styles.colVal}>{mov.debito.toFixed(2)}</Text>
          <Text style={styles.colVal}>{mov.credito.toFixed(2)}</Text>
          <Text style={styles.colVal}>{mov.saldo.toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text>Documento processado por computador - Hash: {Math.random().toString(36).toUpperCase()}</Text>
        <Text>Emitido por: {dados.emitidopor}</Text>
      </View>
    </Page>
  </Document>
);