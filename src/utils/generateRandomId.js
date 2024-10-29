function generateRandomId() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const id = letters.charAt(Math.floor(Math.random() * letters.length)) + 
             Array.from({ length: 7 }, () => digits.charAt(Math.floor(Math.random() * digits.length))).join('');
  return id;
}

module.exports = generateRandomId;

