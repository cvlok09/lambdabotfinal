const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.json());
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1za-mLco0atjbG3ycJS-mi392UnnvAJME0mRWXAfo83c';
app.post('/update', async (req, res) => {
  const message = req.body.message;
  const timestamp = new Date().toISOString();
  try {
    const [firstName, lastName, action] = parseMessage(message);
    const sheetRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Sheet1' });
    const rows = sheetRes.data.values;
    const headers = rows[0];
    const rowIndex = rows.findIndex(row => row[0]?.toLowerCase() === firstName.toLowerCase() && row[1]?.toLowerCase() === lastName.toLowerCase());
    if (rowIndex === -1) throw new Error('Member not found.');
    const duesOwedIndex = headers.findIndex(h => h.toLowerCase().includes('dues owed'));
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!${String.fromCharCode(65 + duesOwedIndex)}${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[0]] }
    });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Log!A:C',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[timestamp, `${firstName} ${lastName} paid`, 'New balance: $0']] }
    });
    res.json({ success: true, message: `Updated ${firstName} ${lastName}'s balance and logged it.` });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
function parseMessage(msg) {
  const regex = /([A-Za-z]+)\s+([A-Za-z]+).*?paid/i;
  const match = msg.match(regex);
  if (!match) throw new Error('Use: "First Last paid"');
  return [match[1], match[2], 'paid'];
}
app.listen(PORT, () => console.log(`Running on ${PORT}`));