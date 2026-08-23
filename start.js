import { DocumentServer } from './src/backend/server.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3344;
const server = new DocumentServer(port);
server.start();
