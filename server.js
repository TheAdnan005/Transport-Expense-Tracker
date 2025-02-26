const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const port = 3019;

const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Database connection
mongoose.connect('mongodb://localhost:27017/ExpenseTracker')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Database connected"));

// Schema
const transportSchema = new mongoose.Schema({
    movementDate: Date,
    vehicleNo: { type: String, required: true },
    containerNo: { type: String, required: true },
    containerSize: { type: String, enum: ["20'", "40'"] },
    cargo: String,
    onAccount: String,
    billTo: String,
    from: String,
    to: String,
    ladenContainerOffload: String,
    invoiceNo: String,
    invoiceDate: Date,
    rate: { type: Number, default: 0 },
    halting: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    advanceDieselAmount: { type: Number, default: 0 },
    balanceToBePaid: { type: Number, default: 0 },
    paidToVendorOn: Date,
    billingRate: { type: Number, default: 0 },
    emptyPickupExpense: { type: Number, default: 0 },
    haltingTwo: { type: Number, default: 0 },
    billingAmount: { type: Number, default: 0 },
    tdsDeducted: { type: Number, default: null },
    netAmountReceived: { type: Number, default: null },
    paymentReceiptDate: Date,
    businessPromotion: String,
    paidOn: Date,
    tripExpenses: String,
    margin: String,
    transporter: String,
    remarks: String,
});

const Transport = mongoose.model("Expense", transportSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dsr.html'));
});

app.post("/post", async (req, res) => {
    try {
        const data = req.body;

        // Convert date fields
        const dateFields = ['movementDate', 'invoiceDate', 'paidToVendorOn',
            'paymentReceiptDate', 'paidOn'];
        dateFields.forEach(field => {
            if (data[field]) {
                data[field] = new Date(data[field]);
                if (isNaN(data[field])) delete data[field];
            }
        });

        // Convert number fields
        const numberFields = ['rate', 'halting', 'totalAmount', 'advanceDieselAmount',
            'balanceToBePaid', 'billingRate', 'emptyPickupExpense',
            'haltingTwo', 'billingAmount', 'tdsDeducted', 'netAmountReceived'];
        numberFields.forEach(field => {
            if (data[field] === '' || data[field] === undefined) {
                data[field] = null;  // or remove this line if you don't want it in the DB at all
            } else {
                data[field] = Number(data[field]);
            }
        });


        const transportData = new Transport(data);
        await transportData.save();
        res.status(201).json({ message: "Data saved successfully!" });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Schema for suggestions
const suggestionSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., "vehicle", "cargo"
    values: [String]
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

// Get suggestions
app.get("/suggestions", async (req, res) => {
    try {
        const suggestions = await Suggestion.find();
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


async function initializeSuggestions() {
    const initialData = [
        { type: "vehicle", values: [] },
        { type: "cargo", values: [] },
        { type: "onAc", values: [] },
        { type: "billTo", values: [] },
        { type: "from", values: [] },
        { type: "to", values: [] },
        { type: "laden", values: [] }
    ];

    for (const data of initialData) {
        const exists = await Suggestion.findOne({ type: data.type });
        if (!exists) {
            await Suggestion.create(data);
        }
    }
}

// Call this function when your server starts
initializeSuggestions();

// Update suggestions
app.post("/suggestions", async (req, res) => {
    try {
        const { type, value } = req.body;
        const suggestion = await Suggestion.findOne({ type });

        if (suggestion) {
            if (!suggestion.values.includes(value)) {
                suggestion.values.push(value);
                await suggestion.save();
            }
        } else {
            await Suggestion.create({ type, values: [value] });
        }

        res.status(201).json({ message: "Suggestion updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => console.log(`Server running on port ${port}`));
