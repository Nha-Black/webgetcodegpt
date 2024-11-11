const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const cors = require('cors');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sggetgp_nhanguyen',
    password: 'Nha190605@&*',
    database: 'sggetgp_mail'
});

app.use(cors());
app.use(express.json());

function find(mail, callback) {
    const query = 'SELECT * FROM Mail WHERE email = ?';
    connection.query(query, [mail], (err, results) => {
        if (err) {
            console.error('Lỗi khi tìm dữ liệu:', err);
            callback(null, null, err);
            return;
        }
        if (results.length > 0) {
            const { email, token } = results[0];
            console.log("", mail);
            callback(email, token, null);
        } else {
            callback(null, null, "Không tìm thấy dữ liệu");
        }
    
    });
}

async function getcode(mail, token) {
    const url = 'https://tools.dongvanfb.net/api/get_messages_oauth2';
    const data = {
        client_id: "9e5f94bc-e8a4-4e73-b8be-63364c29d753",
        email: mail,
        refresh_token: token
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const subject = result.messages.find(message => message.subject.includes("Your ChatGPT code"));
        return subject.subject;
        
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Endpoint xử lý yêu cầu POST đến đường dẫn /data
app.post('/data', (req, res) => {
    const data = req.body;
    
    // Dùng callback để lấy dữ liệu từ database
    find(data.email, (email, token, err) => {
        if (err!=null) {
            return res.status(500).json({ error: "Lỗi truy vấn database" +err });
        }
        if (email && token) {
            getcode(email, token).then(subject =>{
                res.json({ subject:subject });
            });
        } else {
            res.json({ message: "Không tìm thấy dữ liệu cho email này" });
        }
    });
});

// Khởi động server tại cổng 5500
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

process.on('exit', () => {
    connection.end();
});