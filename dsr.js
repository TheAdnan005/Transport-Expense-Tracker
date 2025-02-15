const searchIcon = document.querySelector(".search-icon");
const closeIcon = document.querySelector(".close-icon");
const searchBox = document.querySelector(".search");
const addEntryBtn = document.querySelector(".add-entry");
const entryTable = document.querySelector("tbody");
const clear = document.querySelector(".clear");
let entries = [];

// Toggle form visibility
function toggleForm() {
    const form = document.getElementById("popupForm");
    const overlay = document.getElementById("overlay");
    const isVisible = form.style.display === "grid";
    form.style.display = isVisible ? "none" : "grid";
    overlay.style.display = isVisible ? "none" : "block";
}

// Reset form fields
function resetForm() {
    document.querySelectorAll("#popupForm input, #popupForm select").forEach(input => {
        input.value = "";
    });
}


// Add entry to the list
function addCard() {
    const totalValue = Number(document.getElementById("total").value) || 0;
    const advanceValue = Number(document.getElementById("advance").value) || 0;
    const tdsValue = Number(document.getElementById("tds-deducted").value) || 0;

    const newEntry = {
        movement: document.getElementById("movement").value,
        vehicleNo: document.getElementById("vehicle-no").value,
        contrNo: document.getElementById("contr-no").value,
        twenty: document.getElementById("twenty").value,
        cargo: document.getElementById("cargo").value,
        onAc: document.getElementById("on-ac").value,
        billTo: document.getElementById("bill-to").value,
        from: document.getElementById("from").value,
        to: document.getElementById("to").value,
        ladenContrOffload: document.getElementById("laden-contr-offload").value,
        transporter: document.getElementById("transporter").value,
        invoiceNo: document.getElementById("invoice-no").value,
        invoiceDate: document.getElementById("invoice-date").value,
        rate: document.getElementById("rate").value,
        halting: document.getElementById("halting").value,
        total: totalValue,
        advance: advanceValue,
        balance: document.getElementById("balance").value || (totalValue - advanceValue),
        paidTo: document.getElementById("paid-to").value,
        billingRate: document.getElementById("billing-rate").value,
        emptyPickupExp: document.getElementById("empty-pickup-exp").value,
        billingAmount: document.getElementById("billing-amount").value,
        tds: tdsValue,
        netAmount: document.getElementById("net-amount").value || (totalValue - tdsValue),
        paymentReceipt: document.getElementById("payment-receipt").value,
        businessPromotion: document.getElementById("business-promotion").value,
        paidOn: document.getElementById("paid-on").value,
        expenses: document.getElementById("expenses").value,
        margin: document.getElementById("margin").value,
        remarks: document.getElementById("remarks").value
    };

    entries.push(newEntry);
    updateTable();
    resetForm();
    toggleForm();
}

// Update the table with new entries
function updateTable() {
    entryTable.innerHTML = ""; // Clear previous rows
    entries.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.movement}</td>
            <td>${entry.vehicleNo}</td>
            <td>${entry.contrNo}</td>
            <td>${entry.twenty}</td>
            <td>${entry.cargo}</td>
            <td>${entry.onAc}</td>
            <td>${entry.billTo}</td>
            <td>${entry.from}</td>
            <td>${entry.to}</td>
            <td>${entry.ladenContrOffload}</td>
            <td>${entry.transporter}</td>
            <td>${entry.invoiceNo}</td>
            <td>${entry.invoiceDate}</td>
            <td>${entry.rate}</td>
            <td>${entry.halting}</td>
            <td>${entry.total}</td>
            <td>${entry.advance}</td>
            <td>${entry.balance}</td>
            <td>${entry.paidTo}</td>
            <td>${entry.billingRate}</td>
            <td>${entry.emptyPickupExp}</td>
            <td>${entry.billingAmount}</td>
            <td>${entry.tds}</td>
            <td>${entry.netAmount}</td>
            <td>${entry.paymentReceipt}</td>
            <td>${entry.businessPromotion}</td>
            <td>${entry.paidOn}</td>
            <td>${entry.expenses}</td>
            <td>${entry.margin}</td>
            <td>${entry.remarks}</td>
            <td>
                <button onclick="deleteEntry(${index})">Delete</button>
            </td>
        `;
        entryTable.appendChild(row);
    });
}

// Delete an entry
function deleteEntry(index) {
    if (confirm("Are you sure you want to delete this entry?")) {
        entries.splice(index, 1);
        updateTable();
    }
}
function clearForm(){
    document.querySelectorAll("#popupForm input, #popupForm select").forEach(input => {
        input.value = "";
    });

}
// clear.addEventListener("click",()=>{
    
    
// })

// Search functionality
searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();
    document.querySelectorAll("tbody tr").forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });

    closeIcon.style.display = query.length > 0 ? "block" : "none";
    searchIcon.style.display = query.length > 0 ? "none" : "inline";
});

closeIcon.addEventListener("click", () => {
    searchBox.value = "";
    searchBox.dispatchEvent(new Event("input"));
});

