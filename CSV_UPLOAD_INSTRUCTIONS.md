# CSV Upload Instructions

## CSV Format for Offline Data Entry

When filling data offline, you only need to provide the **three data columns**. The system will automatically calculate all deviations and apply color coding in the Excel export.

### Required CSV Columns

Your CSV file must have these columns (in this order):

1. **facility** - Exact facility name (must match database)
2. **district** - Exact district name (must match database)
3. **period** - Period/date string
4. **indicator_code** - Indicator code (e.g., MA04, MA05a, etc.)
5. **recount_register** - Recount from register (number, can be empty)
6. **figure_105** - Figure 105 (number, can be empty)
7. **figure_dhis2** - Figure DHIS2 (number, can be empty)

### Optional Column

- **team** - Team name (optional, defaults to "csv_upload" if not provided)

### Example CSV

```csv
facility,district,period,indicator_code,recount_register,figure_105,figure_dhis2
Agoro Health Centre III,Lamwo District,January 15, 2025,MA04,100,95,110
Agoro Health Centre III,Lamwo District,January 15, 2025,MA05a,80,75,85
Akworo Health Centre III,Lamwo District,January 15, 2025,MA12,120,115,125
```

### What Happens Automatically

1. **Deviations are calculated** - The system automatically calculates:
   - `dev_dhis2_vs_reg` = (figure_dhis2 - recount_register) / recount_register
   - `dev_105_vs_reg` = (figure_105 - recount_register) / recount_register
   - `dev_105_vs_dhis2` = (figure_105 - figure_dhis2) / figure_dhis2

2. **Color coding in Excel** - When you download the Excel file, deviations are automatically:
   - Formatted as percentages
   - Color-coded:
     - 🟢 Green: ≤ 5% deviation
     - 🟡 Yellow/Amber: 5-10% deviation
     - 🔴 Red: > 10% deviation

### Notes

- Empty values are allowed (leave blank for missing data)
- Facility and district names must match exactly (case-sensitive)
- Indicator codes must match exactly (e.g., "MA04" not "ma04")
- Multiple rows for the same facility+district+period will be grouped into one session

