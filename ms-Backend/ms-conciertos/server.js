require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`ms-conciertos corriendo en puerto ${PORT}`));
