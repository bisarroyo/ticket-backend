import { Router } from "express";

// import {
//   getClientsByCategory,
//   getClientById,
//   getClientByEmail,
//   getClientByName,
//   insertClient,
//   updateClient,
//   removeClient
// } from '@/controllers/events'

const router = Router();

// router.get('/category/:category', getClientsByCategory)
// router.get('/id', getClientById)
// router.get('/email', getClientByEmail)
// router.get('/name', getClientByName)
// router.post('/create', insertClient)
// router.put('/update', updateClient)
// router.delete('/remove', removeClient)

router.get("/", (req, res) => {
  res.send("Events route is working!");
});

export default router;
