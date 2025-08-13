import express from 'express';
import router from './routes';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET']
}));

app.use(express.json());

app.use(router);

app.listen(3001, () => {
    console.log('Application listening to port 3001');
});