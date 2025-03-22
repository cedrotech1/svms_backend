import express from 'express';

import docrouter from '../documentation/index.doc.js';
import userRouter from './userRouter.js';
import authRouter from './authRouter.js';
import Post from './PostRouter.js';
import CategoriesRouter from './categoriesRouter.js';
import notification from './notificationRouter.js';
import Address from './AddressRouter.js';
const router = express.Router();

router.use('/docs', docrouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/post', Post);
router.use('/categories', CategoriesRouter);
router.use('/address', Address);
router.use('/notification', notification);


export default router;
