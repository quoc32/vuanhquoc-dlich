const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

// Need body parser to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quoc Vu Hotel - Đặt Phòng</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background-color: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: left;
          max-width: 500px;
          width: 100%;
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        p {
          color: #7f8c8d;
          line-height: 1.5;
          text-align: center;
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #555;
        }
        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .btn {
          display: block;
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.75rem;
          background-color: #3498db;
          color: white;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
          text-align: center;
        }
        .btn:hover {
          background-color: #2980b9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Quoc Vu Hotel</h1>
        <p>Hệ thống đặt phòng trực tuyến đối tác QTravel</p>
        
        <form action="/book" method="POST">
          <div class="form-group">
            <label for="email">Email tài khoản QTravel của bạn:</label>
            <input type="email" id="email" name="email" required placeholder="vidu@email.com">
          </div>
          
          <div class="form-group">
            <label for="roomType">Loại phòng:</label>
            <select id="roomType" name="roomType">
              <option value="Standard">Standard (1,000,000 VND)</option>
              <option value="Deluxe">Deluxe (1,500,000 VND)</option>
              <option value="Suite">Suite (2,500,000 VND)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="checkIn">Ngày nhận phòng:</label>
            <input type="date" id="checkIn" name="checkIn" required>
          </div>
          
          <div class="form-group">
            <label for="checkOut">Ngày trả phòng:</label>
            <input type="date" id="checkOut" name="checkOut" required>
          </div>
          
          <button type="submit" class="btn">Xác Nhận Đặt Phòng</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Booking route
app.post('/book', async (req, res) => {
  try {
    const { email, roomType, checkIn, checkOut } = req.body;
    
    // Generate a simple booking ID
    const bookingId = 'QV' + Math.floor(Math.random() * 1000000);
    
    let totalPrice = 1000000;
    if (roomType === 'Deluxe') totalPrice = 1500000;
    if (roomType === 'Suite') totalPrice = 2500000;

    const payload = {
      bookingId,
      userEmail: email,
      hotelId: 'Hotelqqqqq123IDle',
      hotelName: 'Quoc Vu Hotel',
      roomType,
      checkIn,
      checkOut,
      totalPrice
    };

    // Use native fetch to call QTravel Webhook
    // Note: If QTravel API is on port 3000
    const webhookUrl = 'http://localhost:3000/api/v1/webhooks/hotel-order';
    
    console.log('Sending webhook to:', webhookUrl);
    console.log('Payload:', payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to send webhook');
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Phòng Thành Công</title>
        <style>
          body { font-family: Arial; text-align: center; margin-top: 50px; background: #f4f4f9; }
          .container { background: #fff; padding: 30px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #27ae60; }
          a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: #fff; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 Đặt Phòng Thành Công!</h1>
          <p>Mã đặt phòng của bạn: <strong>${bookingId}</strong></p>
          <p>Dữ liệu đã được đồng bộ với nền tảng QTravel.</p>
          <p>Bạn có thể kiểm tra ở trang Quản lý Đặt chỗ trên QTravel.</p>
          <a href="/">Quay Lại</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('<h2>Đã có lỗi xảy ra khi đồng bộ đặt phòng. Vui lòng kiểm tra xem QTravel server đang chạy chưa.</h2>');
  }
});

app.listen(PORT, () => {
  console.log(`Quoc Vu Hotel Backend is running on http://localhost:${PORT}`);
});
