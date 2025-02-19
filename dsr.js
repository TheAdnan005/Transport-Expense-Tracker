function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
}
  
  function exportToExcel() {
    let table = document.getElementById("expenseTable");
    let workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.table_to_sheet(table);
  
    // Zero-based column indexes that contain date values
    let dateColumns = [1, 12, 18, 25, 27];
  
    dateColumns.forEach(colIndex => {
      let colLetter = XLSX.utils.encode_col(colIndex);
  
      for (let rowNum = 2; rowNum <= 2000; rowNum++) {
        let cellRef = colLetter + rowNum;
        let cell = worksheet[cellRef];
  
        if (cell && cell.v) {
          let value = cell.v;
  
          if (typeof value === "number") {
            // Adjust for Excel's leap year bug:
            // For values >= 60, subtract one day.
            let adjustedValue = (value >= 60) ? value - 1 : value;
            // Excel's day 1 is 1900-01-01, so subtract 1 and convert
            let actualDate = new Date((adjustedValue - 1) * 86400000 + Date.UTC(1900, 0, 1));
            cell.v = formatDateString(actualDate);
            cell.t = "s";
          } else if (typeof value === "string") {
            // Split string on any non-digit (handles "YYYY-MM-DD", "YYYY/MM/DD", etc.)
            let parts = value.split(/[^0-9]/).filter(Boolean);
            if (parts.length === 3) {
              let [year, month, day] = parts;
              cell.v = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
              cell.t = "s";
            }
          }
        }
      }
  
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      worksheet['!cols'][colIndex] = { wch: 12 };
    });
  
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "Expense_Report.xlsx");
  }
  

const searchIcon = document.querySelector(".search-icon");
const closeIcon = document.querySelector(".close-icon");
const searchBox = document.querySelector(".search");
const addEntryBtn = document.querySelector(".add-entry");
const clearBtn = document.querySelector(".clear");
const entryTable = document.querySelector("#expenseTable tbody");

const datalistVehicle = document.getElementById("vehicle-suggestions");
const datalistCargo = document.getElementById("cargo-list");
const datalistOnAc = document.getElementById("on-ac-list");
const datalistBillTo = document.getElementById("bill-to-list");
const datalistFrom = document.getElementById("from-list");
const datalistTo = document.getElementById("to-list");
const datalistLaden = document.getElementById("laden-list");

let vehicleNumbers = JSON.parse(localStorage.getItem("vehicleNumbers")) || [];
let cargoItems = JSON.parse(localStorage.getItem("cargoItems")) || [];
let onAcList = JSON.parse(localStorage.getItem("onAcList")) || [];
let billToList = JSON.parse(localStorage.getItem("billToList")) || [];
let fromList = JSON.parse(localStorage.getItem("fromList")) || [];
let toList = JSON.parse(localStorage.getItem("toList")) || [];
let ladenList = JSON.parse(localStorage.getItem("ladenList")) || [];

let entries = [];

function toggleForm() {
    const form = document.getElementById("popupForm");
    const overlay = document.getElementById("overlay");
    const isVisible = form.style.display === "grid";
    form.style.display = isVisible ? "none" : "grid";
    overlay.style.display = isVisible ? "none" : "block";
}

function resetForm() {
    document.querySelectorAll("#popupForm input, #popupForm select").forEach(input => input.value = "");
}

function updateSuggestions(datalist, data) {
    datalist.innerHTML = "";
    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        datalist.appendChild(option);
    });
}

function updateAllSuggestions() {
    updateSuggestions(datalistVehicle, vehicleNumbers);
    updateSuggestions(datalistCargo, cargoItems);
    updateSuggestions(datalistOnAc, onAcList);
    updateSuggestions(datalistBillTo, billToList);
    updateSuggestions(datalistFrom, fromList);
    updateSuggestions(datalistTo, toList);
    updateSuggestions(datalistLaden, ladenList);
}

function addCard() {
    const getValue = (id) => document.getElementById(id).value.trim().toUpperCase();
    const totalValue = Number(getValue("total")) || 0;
    const advanceValue = Number(getValue("advance")) || 0;
    const tdsValue = Number(getValue("tds-deducted")) || 0;

    const valuesToStore = [
        { key: "vehicleNumbers", value: getValue("vehicle-no"), storage: vehicleNumbers },
        { key: "cargoItems", value: getValue("cargo"), storage: cargoItems },
        { key: "onAcList", value: getValue("on-ac"), storage: onAcList },
        { key: "billToList", value: getValue("bill-to"), storage: billToList },
        { key: "fromList", value: getValue("from"), storage: fromList },
        { key: "toList", value: getValue("to"), storage: toList },
        { key: "ladenList", value: getValue("laden-contr-offload"), storage: ladenList }
    ];

    valuesToStore.forEach(({ key, value, storage }) => {
        if (value && !storage.includes(value)) {
            storage.push(value);
            localStorage.setItem(key, JSON.stringify(storage));
        }
    });

    updateAllSuggestions();

    const newEntry = {
        movement: getValue("movement"),
        vehicleNo: getValue("vehicle-no"),
        contrNo: getValue("contr-no"),
        twenty: getValue("twenty"),
        cargo: getValue("cargo"),
        onAc: getValue("on-ac"),
        billTo: getValue("bill-to"),
        from: getValue("from"),
        to: getValue("to"),
        ladenContrOffload: getValue("laden-contr-offload"),
        invoiceNo: getValue("invoice-no"),
        invoiceDate: getValue("invoice-date"),
        rate: getValue("rate"),
        halting: getValue("halting"),
        total: totalValue,
        advance: advanceValue,
        balance: getValue("balance") || (totalValue - advanceValue),
        paidTo: getValue("paid-to"),
        billingRate: getValue("billing-rate"),
        emptyPickupExp: getValue("empty-pickup-exp"),
        haltingTwo: getValue("halting-2"),
        billingAmount: getValue("billing-amount"),
        tds: tdsValue,
        netAmount: getValue("net-amount") || (totalValue - tdsValue),
        paymentReceipt: getValue("payment-receipt"),
        businessPromotion: getValue("business-promotion"),
        paidOn: getValue("paid-on"),
        expenses: getValue("expenses"),
        margin: getValue("margin"),
        Transporter: getValue("transporter"),
        remarks: getValue("remarks")
    };

    entries.push(newEntry);
    updateTable();
    resetForm();
    toggleForm();
}

function calculateTotal() {
    const rate = Number(document.getElementById("rate").value) || 0;
    const halting = Number(document.getElementById("halting").value) || 0;
    const total = rate + halting;
    document.getElementById("total").value = total;
    const advance = Number(document.getElementById("advance").value) || 0;
    const balance = total - advance;
    document.getElementById("balance").value = balance;
    const billingRate = Number(document.getElementById("billing-rate").value) || 0;
    const emptyPickupExp = Number(document.getElementById("empty-pickup-exp").value) || 0;
    const haltingTwo = Number(document.getElementById("halting-2").value) || 0;
    const billingAmount = billingRate + emptyPickupExp + haltingTwo;
    document.getElementById("billing-amount").value = billingAmount;
    const tds = billingAmount * 0.01;
    document.getElementById("tds-deducted").value = tds;
    document.getElementById("net-amount").value = billingAmount - tds;
    const businessPromotion = Number(document.getElementById("business-promotion").value) || 0;
    const tripExpenses = Number(document.getElementById("expenses").value) || 0;

    document.getElementById("margin").value = billingAmount - tripExpenses - businessPromotion;
}

document.getElementById("rate").addEventListener("input", calculateTotal);
document.getElementById("halting").addEventListener("input", calculateTotal);
document.getElementById("advance").addEventListener("input", calculateTotal);
document.getElementById("halting").addEventListener("input", calculateTotal);
document.getElementById("billing-rate").addEventListener("input", calculateTotal);
document.getElementById("empty-pickup-exp").addEventListener("input", calculateTotal);
document.getElementById("halting-2").addEventListener("input", calculateTotal);
document.getElementById("business-promotion").addEventListener("input", calculateTotal);
document.getElementById("expenses").addEventListener("input", calculateTotal);

function updateTable() {
    entryTable.innerHTML = "";
    entries.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(entry.movement)}</td>
            <td>${entry.vehicleNo}</td>
            <td>${entry.contrNo}</td>
            <td>${entry.twenty}</td>
            <td>${entry.cargo}</td>
            <td>${entry.onAc}</td>
            <td>${entry.billTo}</td>
            <td>${entry.from}</td>
            <td>${entry.to}</td>
            <td>${entry.ladenContrOffload}</td>
            <td>${entry.invoiceNo}</td>
            <td>${formatDate(entry.invoiceDate)}</td>
            <td>${entry.rate}</td>
            <td>${entry.halting}</td>
            <td>${entry.total}</td>
            <td>${entry.advance}</td>
            <td>${entry.balance}</td>
            <td>${entry.paidTo}</td>
            <td>${entry.billingRate}</td>
            <td>${entry.emptyPickupExp}</td>
            <td>${entry.haltingTwo}</td>
            <td>${entry.billingAmount}</td>
            <td>${entry.tds}</td>
            <td>${entry.netAmount}</td>
            <td>${formatDate(entry.paymentReceipt)}</td>
            <td>${entry.businessPromotion}</td>
            <td>${formatDate(entry.paidOn)}</td>
            <td>${entry.expenses}</td>
            <td>${entry.margin}</td>
            <td>${entry.Transporter}</td>
            <td>${entry.remarks}</td>
        `;
        entryTable.appendChild(row);
    });
}

addEntryBtn.addEventListener("click", toggleForm);
clearBtn.addEventListener("click", resetForm);
searchIcon.addEventListener("click", () => searchBox.classList.add("active"));
closeIcon.addEventListener("click", () => searchBox.classList.remove("active"));
updateAllSuggestions();
