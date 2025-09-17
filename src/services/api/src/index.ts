import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger } from './util/logger';
import { PORT } from './config';

import health from './routes/health';
import merchants from './routes/merchants';
import payments from './routes/payments';
import settlements from './routes/settlements';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.use('/api', health, merchants, payments, settlements);

app.listen(PORT, () => console.log(`API on :${PORT}`));