/**
 * Simulated email service that logs links to the terminal console
 * and provides links for dev API responses.
 */

const sendSimulatedEmail = ({ to, subject, template, token, url }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const fullUrl = url || `${clientUrl}/verify-email?token=${token}`;

  const border = '═'.repeat(70);
  console.log('\n' + border);
  console.log(` 📧 [SIMULATED EMAIL SERVICE]`);
  console.log(` To:      ${to}`);
  console.log(` Subject: ${subject}`);
  console.log(` Action:  ${template}`);
  console.log(` Link:    ${fullUrl}`);
  console.log(border + '\n');

  return {
    to,
    subject,
    template,
    token,
    url: fullUrl,
    simulated: true,
  };
};

module.exports = {
  sendSimulatedEmail,
};
