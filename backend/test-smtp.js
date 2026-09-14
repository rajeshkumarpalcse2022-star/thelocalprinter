const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rajeshkumarpal.cse2022@nsec.ac.in',
      pass: 'wgaa obkq tqdv qseg',
    },
  });
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    const info = await transporter.sendMail({
      from: 'Local Printer <rajeshkumarpal.cse2022@nsec.ac.in>',
      to: 'rajeshpal81457@gmail.com',
      subject: 'Test OTP - Local Printer',
      html: '<h2>Test OTP: 123456</h2><p>This is a test email.</p>',
    });
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('SMTP Error:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (err.response) console.error('Response:', err.response);
  }
}
test();
