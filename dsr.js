
flatpickr("input[type='date']", {
    dateFormat: "Y-m-d",
    theme: "dark",
});

function isValidDate(obj) {
    return (
        Object.prototype.toString.call(obj) === "[object Date]" &&
        !isNaN(obj.getTime())
    );
}

/**
 * Converts a valid Date object to "DD.MM.YYYY".
 */
function formatDate(dateObj) {
    if (!isValidDate(dateObj)) {
        console.error("Invalid date object:", dateObj);
        return "Invalid Date"; // Return a fallback value
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}.${month}.${year}`;
}


function validateNumberInput(input) {
    if (input.value === "") {
        input.setCustomValidity("This field cannot be empty.");
    } else {
        input.setCustomValidity("");
    }
}
/**
 * Converts an Excel serial date number to a JavaScript Date,
 * adjusting for Excel's leap year bug if needed.
 */
function parseExcelDate(value) {
    if (typeof value === "number") {
        return new Date((value - 25569) * 86400000); // Convert Excel date to JS date
    } else if (typeof value === "string") {
        const parsed = new Date(value);
        return isValidDate(parsed) ? parsed : null;
    }
    return null;
}

/**
 * Parses a string that might be in "YYYY-MM-DD", "DD-MM-YYYY", or
 * slash-based formats, returning a Date if possible. Otherwise returns null.
 */
function parseDateString(dateStr) {
    const parts = dateStr.split(/[^0-9]/).filter(Boolean);
    if (parts.length !== 3) return null;

    // Detect the 4-digit year
    const yearIndex = parts.findIndex((p) => p.length === 4);
    if (yearIndex === -1) return null;

    let year, month, day;

    if (yearIndex === 0) {
        [year, month, day] = parts; // "YYYY-MM-DD"
    } else if (yearIndex === 2) {
        [day, month, year] = parts; // "DD-MM-YYYY"
    } else {
        return null; // Invalid format
    }

    const parsedDate = new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10)
    );
    return isValidDate(parsedDate) ? parsedDate : null;
}

/**
 * Exports table data to an Excel file, ensuring date columns are formatted correctly.
 */
function exportToExcel() {
    const table = document.getElementById("expenseTable");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);

    const dateColumns = [1, 12, 18, 25, 27];

    dateColumns.forEach((colIndex) => {
        const colLetter = XLSX.utils.encode_col(colIndex);

        for (let rowNum = 2; rowNum <= 2000; rowNum++) {
            const cellRef = colLetter + rowNum;
            const cell = worksheet[cellRef];
            if (!cell || cell.v == null) continue;

            const value = cell.v;

            // 1) Numeric: Excel serial date
            if (typeof value === "number") {
                const jsDate = parseExcelDate(value);
                if (isValidDate(jsDate)) {
                    cell.v = formatDate(jsDate);
                    cell.t = "s";
                }
            }
            // 2) Already a Date object
            else if (isValidDate(value)) {
                cell.v = formatDate(value);
                cell.t = "s";
            }
            // 3) A string that might be "YYYY-MM-DD", "DD-MM-YYYY", etc.
            else if (typeof value === "string") {
                const parsedDate = parseDateString(value);
                if (parsedDate) {
                    cell.v = formatDate(parsedDate);
                    cell.t = "s";
                }
            }
        }

        if (!worksheet["!cols"]) worksheet["!cols"] = [];
        worksheet["!cols"][colIndex] = { wch: 12 };
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
    document
        .querySelectorAll("#popupForm input, #popupForm select")
        .forEach((input) => (input.value = ""));
}

function updateSuggestions(datalist, data) {
    datalist.innerHTML = "";
    data.forEach((item) => {
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

// function addCard() {
//     const getValue = (id) =>
//         document.getElementById(id).value.trim().toUpperCase();
//     const totalValue = Number(getValue("total")) || 0;
//     const advanceValue = Number(getValue("advance")) || 0;
//     const tdsValue = Number(getValue("tds-deducted")) || 0;

//     const valuesToStore = [
//         {
//             key: "vehicleNumbers",
//             value: getValue("vehicle-no"),
//             storage: vehicleNumbers,
//         },
//         { key: "cargoItems", value: getValue("cargo"), storage: cargoItems },
//         { key: "onAcList", value: getValue("on-ac"), storage: onAcList },
//         { key: "billToList", value: getValue("bill-to"), storage: billToList },
//         { key: "fromList", value: getValue("from"), storage: fromList },
//         { key: "toList", value: getValue("to"), storage: toList },
//         {
//             key: "ladenList",
//             value: getValue("laden-contr-offload"),
//             storage: ladenList,
//         },
//     ];

//     valuesToStore.forEach(({ key, value, storage }) => {
//         if (value && !storage.includes(value)) {
//             storage.push(value);
//             localStorage.setItem(key, JSON.stringify(storage));
//         }
//     });

//     updateAllSuggestions();

//     const newEntry = {
//         movement: getValue("movement"),
//         vehicleNo: getValue("vehicle-no"),
//         contrNo: getValue("contr-no"),
//         twenty: getValue("twenty"),
//         cargo: getValue("cargo"),
//         onAc: getValue("on-ac"),
//         billTo: getValue("bill-to"),
//         from: getValue("from"),
//         to: getValue("to"),
//         ladenContrOffload: getValue("laden-contr-offload"),
//         invoiceNo: getValue("invoice-no"),
//         invoiceDate: getValue("invoice-date"),
//         rate: getValue("rate"),
//         halting: getValue("halting"),
//         total: totalValue,
//         advance: advanceValue,
//         balance: getValue("balance") || totalValue - advanceValue,
//         paidTo: getValue("paid-to"),
//         billingRate: getValue("billing-rate"),
//         emptyPickupExp: getValue("empty-pickup-exp"),
//         haltingTwo: getValue("halting-2"),
//         billingAmount: getValue("billing-amount"),
//         tds: tdsValue,
//         netAmount: getValue("net-amount") || totalValue - tdsValue,
//         paymentReceipt: getValue("payment-receipt"),
//         businessPromotion: getValue("business-promotion"),
//         paidOn: getValue("paid-on"),
//         expenses: getValue("expenses"),
//         margin: getValue("margin"),
//         Transporter: getValue("transporter"),
//         remarks: getValue("remarks"),
//     };

//     entries.push(newEntry);
//     updateTable();
//     resetForm();
//     toggleForm();
// }

function calculateTotal() {
    const rate = Number(document.getElementById("rate").value) || 0;
    const halting = Number(document.getElementById("halting").value) || 0;
    const total = rate + halting;
    document.getElementById("total").value = total;
    const advance = Number(document.getElementById("advance").value) || 0;
    const balance = total - advance;
    document.getElementById("balance").value = balance;
    const billingRate =
        Number(document.getElementById("billing-rate").value) || 0;
    const emptyPickupExp =
        Number(document.getElementById("empty-pickup-exp").value) || 0;
    const haltingTwo = Number(document.getElementById("halting-2").value) || 0;
    const billingAmount = billingRate + emptyPickupExp + haltingTwo;
    document.getElementById("billing-amount").value = billingAmount;
    const tds = billingAmount * 0.01;
    document.getElementById("tds-deducted").value = tds;
    document.getElementById("net-amount").value = billingAmount - tds;
    const businessPromotion =
        Number(document.getElementById("business-promotion").value) || 0;
    const tripExpenses = Number(document.getElementById("expenses").value) || 0;

    document.getElementById("margin").value =
        billingAmount - tripExpenses - businessPromotion;
}

document.getElementById("rate").addEventListener("input", calculateTotal);
document.getElementById("halting").addEventListener("input", calculateTotal);
document.getElementById("advance").addEventListener("input", calculateTotal);
document.getElementById("halting").addEventListener("input", calculateTotal);
document
    .getElementById("billing-rate")
    .addEventListener("input", calculateTotal);
document
    .getElementById("empty-pickup-exp")
    .addEventListener("input", calculateTotal);
document.getElementById("halting-2").addEventListener("input", calculateTotal);
document
    .getElementById("business-promotion")
    .addEventListener("input", calculateTotal);
document.getElementById("expenses").addEventListener("input", calculateTotal);

function updateTable() {
    entryTable.innerHTML = "";
    entries.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(new Date(entry.movement))}</td>
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
            <td>${formatDate(new Date(entry.invoiceDate))}</td>
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
            <td>${formatDate(new Date(entry.paymentReceipt))}</td>
            <td>${entry.businessPromotion}</td>
            <td>${formatDate(new Date(entry.paidOn))}</td>
            <td>${entry.expenses}</td>
            <td>${entry.margin}</td>
            <td>${entry.Transporter}</td>
            <td>${entry.remarks}</td>
            <td>
        <button class="edit-btn" onclick="editEntry(${index})">✏️</button>
        <button class="delete-btn" onclick="deleteEntry(${index})">🗑️</button>
      </td>
        `;
        entryTable.appendChild(row);
    });
}

let editIndex = -1;

// Function to edit entry
window.editEntry = function (index) {


    if (index < 0 || index >= entries.length) {
        console.error("Invalid index:", index);
        return;
    }

    editIndex = index;
    const entry = entries[index];

    // Ensure entry is valid
    if (!entry) {
        console.error("Entry not found at index:", index);
        return;
    }

    // Populate the modal inputs
    document.getElementById("edit-movement").value = entry.movement || "";
    document.getElementById("edit-vehicle-no").value = entry.vehicleNo || "";
    document.getElementById("edit-contr-no").value = entry.contrNo || "";
    document.getElementById("edit-twenty").value = entry.twenty || "";
    document.getElementById("edit-cargo").value = entry.cargo || "";
    document.getElementById("edit-on-ac").value = entry.onAc || "";
    document.getElementById("edit-bill-to").value = entry.billTo || "";
    document.getElementById("edit-from").value = entry.from || "";
    document.getElementById("edit-to").value = entry.to || "";
    document.getElementById("edit-laden-contr-offload").value = entry.ladenContrOffload || "";
    document.getElementById("edit-invoice-no").value = entry.invoiceNo || "";
    document.getElementById("edit-invoice-date").value = entry.invoiceDate || "";
    document.getElementById("edit-rate").value = entry.rate || "";
    document.getElementById("edit-halting").value = entry.halting || "";
    document.getElementById("edit-total").value = entry.total || "";
    document.getElementById("edit-advance").value = entry.advance || "";
    document.getElementById("edit-balance").value = entry.balance || "";
    document.getElementById("edit-paid-to").value = entry.paidTo || "";
    document.getElementById("edit-billing-rate").value = entry.billingRate || "";
    document.getElementById("edit-empty-pickup-exp").value = entry.emptyPickupExp || "";
    document.getElementById("edit-halting-2").value = entry.haltingTwo || "";
    document.getElementById("edit-billing-amount").value = entry.billingAmount || "";
    document.getElementById("edit-tds-deducted").value = entry.tds || "";
    document.getElementById("edit-net-amount").value = entry.netAmount || "";
    document.getElementById("edit-payment-receipt").value = entry.paymentReceipt || "";
    document.getElementById("edit-business-promotion").value = entry.businessPromotion || "";
    document.getElementById("edit-paid-on").value = entry.paidOn || "";
    document.getElementById("edit-expenses").value = entry.expenses || "";
    document.getElementById("edit-margin").value = entry.margin || "";
    document.getElementById("edit-transporter").value = entry.Transporter || "";
    document.getElementById("edit-remarks").value = entry.remarks || "";

    // Update suggestions in the edit modal
    updateAllSuggestions();


    function EditcalculateTotal() {
        const rate = Number(document.getElementById("edit-rate").value) || 0;
        const halting = Number(document.getElementById("edit-halting").value) || 0;
        const total = rate + halting;
        document.getElementById("edit-total").value = total;
        const advance = Number(document.getElementById("edit-advance").value) || 0;
        const balance = total - advance;
        document.getElementById("edit-balance").value = balance;
        const billingRate = Number(document.getElementById("edit-billing-rate").value) || 0;
        const emptyPickupExp = Number(document.getElementById("edit-empty-pickup-exp").value) || 0;
        const haltingTwo = Number(document.getElementById("edit-halting-2").value) || 0;
        const billingAmount = billingRate + emptyPickupExp + haltingTwo;
        document.getElementById("edit-billing-amount").value = billingAmount;
        const tds = billingAmount * 0.01;
        document.getElementById("edit-tds-deducted").value = tds;
        document.getElementById("edit-net-amount").value = billingAmount - tds;
        const businessPromotion = Number(document.getElementById("edit-business-promotion").value) || 0;
        const tripExpenses = Number(document.getElementById("edit-expenses").value) || 0;

        document.getElementById("edit-margin").value = billingAmount - tripExpenses - businessPromotion;
    }

    // Remove any existing event listeners first to prevent duplicates
    const editInputs = [
        "edit-rate", "edit-halting", "edit-advance", "edit-billing-rate",
        "edit-empty-pickup-exp", "edit-halting-2", "edit-business-promotion", "edit-expenses"
    ];

    editInputs.forEach(id => {
        const element = document.getElementById(id);
        element.replaceWith(element.cloneNode(true)); // Remove existing listeners
    });

    // Add correct event listeners
    document.getElementById("edit-rate").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-halting").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-advance").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-billing-rate").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-empty-pickup-exp").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-halting-2").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-business-promotion").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-expenses").addEventListener("input", EditcalculateTotal);
    document.getElementById("edit-modal").style.display = "block";
};


document.getElementById("confirm-edit").addEventListener("click", function () {
    if (editIndex < 0 || editIndex >= entries.length) {
        console.error("Invalid editIndex:", editIndex);
        return;
    }

    entries[editIndex] = {
        movement: document.getElementById("edit-movement").value,
        vehicleNo: document.getElementById("edit-vehicle-no").value,
        contrNo: document.getElementById("edit-contr-no").value,
        twenty: document.getElementById("edit-twenty").value,
        cargo: document.getElementById("edit-cargo").value,
        onAc: document.getElementById("edit-on-ac").value,
        billTo: document.getElementById("edit-bill-to").value,
        from: document.getElementById("edit-from").value,
        to: document.getElementById("edit-to").value,
        ladenContrOffload: document.getElementById("edit-laden-contr-offload").value,
        invoiceNo: document.getElementById("edit-invoice-no").value,
        invoiceDate: document.getElementById("edit-invoice-date").value,
        rate: parseFloat(document.getElementById("edit-rate").value) || 0,
        halting: parseFloat(document.getElementById("edit-halting").value) || 0,
        total: parseFloat(document.getElementById("edit-total").value) || 0,
        advance: parseFloat(document.getElementById("edit-advance").value) || 0,
        balance: parseFloat(document.getElementById("edit-balance").value) || 0,
        paidTo: document.getElementById("edit-paid-to").value,
        billingRate: parseFloat(document.getElementById("edit-billing-rate").value) || 0,
        emptyPickupExp: parseFloat(document.getElementById("edit-empty-pickup-exp").value) || 0,
        haltingTwo: parseFloat(document.getElementById("edit-halting-2").value) || 0,
        billingAmount: parseFloat(document.getElementById("edit-billing-amount").value) || 0,
        tds: parseFloat(document.getElementById("edit-tds-deducted").value) || 0,
        netAmount: parseFloat(document.getElementById("edit-net-amount").value) || 0,
        paymentReceipt: document.getElementById("edit-payment-receipt").value,
        businessPromotion: parseFloat(document.getElementById("edit-business-promotion").value) || 0,
        paidOn: document.getElementById("edit-paid-on").value,
        expenses: parseFloat(document.getElementById("edit-expenses").value) || 0,
        margin: parseFloat(document.getElementById("edit-margin").value) || 0,
        Transporter: document.getElementById("edit-transporter").value,
        remarks: document.getElementById("edit-remarks").value
    };


    // Update the table display
    updateTable();

    // Close the modal
    closeModal("edit-modal");
});

// Function to close modal
window.closeModal = function (modalId) {
    document.getElementById(modalId).style.display = "none";
};


let suggestions = {};

// Fetch suggestions from MongoDB
async function fetchSuggestions() {
    try {
        const response = await fetch("/suggestions");
        const data = await response.json();
        suggestions = data.reduce((acc, { type, values }) => {
            acc[type] = values;
            return acc;
        }, {});
        updateAllSuggestions();
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
}

// Update suggestions in the UI
function updateAllSuggestions() {
    const datalists = {
        vehicle: datalistVehicle,
        cargo: datalistCargo,
        onAc: datalistOnAc,
        billTo: datalistBillTo,
        from: datalistFrom,
        to: datalistTo,
        laden: datalistLaden
    };

    Object.entries(datalists).forEach(([type, datalist]) => {
        datalist.innerHTML = "";
        if (suggestions[type]) {
            suggestions[type].forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                datalist.appendChild(option);
            });
        }
    });
}

// Add a new suggestion to MongoDB
async function addSuggestion(type, value) {
    if (!value || suggestions[type]?.includes(value)) return;

    try {
        await fetch("/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, value })
        });
        if (!suggestions[type]) suggestions[type] = [];
        suggestions[type].push(value);
        updateAllSuggestions();
    } catch (error) {
        console.error("Error adding suggestion:", error);
    }
}

// Update addCard function to save suggestions
async function addCard() {
    const getValue = (id) => document.getElementById(id).value.trim().toUpperCase();

    const valuesToStore = [
        { type: "vehicle", value: getValue("vehicle-no") },
        { type: "cargo", value: getValue("cargo") },
        { type: "onAc", value: getValue("on-ac") },
        { type: "billTo", value: getValue("bill-to") },
        { type: "from", value: getValue("from") },
        { type: "to", value: getValue("to") },
        { type: "laden", value: getValue("laden-contr-offload") }
    ];

    valuesToStore.forEach(({ type, value }) => addSuggestion(type, value));

    // Rest of your addCard logic...

    const totalValue = Number(getValue("total")) || 0;
    const advanceValue = Number(getValue("advance")) || 0;
    const tdsValue = Number(getValue("tds-deducted")) || 0;


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
        balance: getValue("balance") || totalValue - advanceValue,
        paidTo: getValue("paid-to"),
        billingRate: getValue("billing-rate"),
        emptyPickupExp: getValue("empty-pickup-exp"),
        haltingTwo: getValue("halting-2"),
        billingAmount: getValue("billing-amount"),
        tds: tdsValue,
        netAmount: getValue("net-amount") || totalValue - tdsValue,
        paymentReceipt: getValue("payment-receipt"),
        businessPromotion: getValue("business-promotion"),
        paidOn: getValue("paid-on"),
        expenses: getValue("expenses"),
        margin: getValue("margin"),
        Transporter: getValue("transporter"),
        remarks: getValue("remarks"),
    };

    entries.push(newEntry);
    updateTable();
    resetForm();
    toggleForm();




}

fetchSuggestions();

document.getElementById('edit-modal').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Convert empty strings to null for optional fields
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        const response = await fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Data saved successfully!');
            toggleForm();
            clearForm();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to save data');
    }
});


function clearStoredData() {
    // List of keys to remove from localStorage
    const keys = [
        "vehicleNumbers",
        "cargoItems",
        "onAcList",
        "billToList",
        "fromList",
        "toList",
        "ladenList"
    ];

    // Loop through each key and remove it from localStorage
    keys.forEach(key => {
        localStorage.removeItem(key);
        key = [];
    });

    alert("Stored vehicle data cleared!");
}


addEntryBtn.addEventListener("click", toggleForm);
clearBtn.addEventListener("click", resetForm);
searchIcon.addEventListener("click", () => searchBox.classList.add("active"));
closeIcon.addEventListener("click", () => searchBox.classList.remove("active"));
updateAllSuggestions();
