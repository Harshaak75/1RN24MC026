import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv'

const app = express();
const port = 3000;

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class SlidingWindow {
    constructor(size) {
        this.size = size;
        this.window = [];
    }

    add(num) {
        if (!this.window.includes(num)) {
            if (this.window.length >= this.size) {
                this.window.shift();
            }
            this.window.push(num);
        }
    }

    getAverage() {
        if (this.window.length === 0) return 0;
        return (this.window.reduce((a, b) => a + b, 0) / this.window.length).toFixed(2);
    }

    getState() {
        return [...this.window];
    }
}

const windowSize = 10;
const windowManager = new SlidingWindow(windowSize);

const getData = async (value) => {
    const token = process.env.ACCESS_TOKEN;
    try {
        const data = await axios.get(`http://20.244.56.144/evaluation-service/${value}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        console.log(data.data.numbers)
        return data.data.numbers;
    } catch (error) {
        console.log("error", error.message);
        return [];
    }
};

const fetchNumber = async (type) => {
    await new Promise(res => setTimeout(res, 500));
    if (type === 'p') return await getData("primes");
    if (type === 'e') return await getData("even");
    if (type === 'f') return await getData("fibo");
    if (type === 'r') return await getData("rand");
    return [];
};

app.get("/numbers/:numberid", async (req, res) => {
    const { numberid } = req.params;
    const windowPrev = windowManager.getState();

    const nums = await fetchNumber(numberid);

    // Add each unique number to the window
    if (Array.isArray(nums)) {
        nums.forEach(num => windowManager.add(num));
    } else if (typeof nums === 'number') {
        windowManager.add(nums);
    }

    const windowCurr = windowManager.getState();

    res.json({
        windowprev: windowPrev,
        windowcurrstate: windowCurr,
        number: nums,
        avg: windowManager.getAverage()
    });
});

app.listen(port, () => {
    console.log("The server is listening on:", port);
});