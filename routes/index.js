//import express
const express = require('express')

//import middleware upload
const upload = require('../middleware/upload');

//import validators
const { validateBarang, validateBarangMasuk, validateBarangKeluar } = require('../utils/validators/barang');

//init express router
const router = express.Router();

//import post controller
const barang = require('../controllers/BarangController');
const barangMasuk = require('../controllers/BarangMasukController');
const barangKeluar = require('../controllers/BarangKeluarController');

// barang
router.get('/barang', barang.findBarang);
router.get('/barang/:id', barang.detailBarang);
router.post('/barang', upload.single('gambar'), validateBarang, barang.storeBarang);
router.put('/barang/:id', upload.single('gambar'), validateBarang, barang.updateBarang);
router.delete('/barang/:id', barang.deleteBarang);

// barang masuk
router.get('/barang-masuk', barangMasuk.findBarangMasuk);
router.post('/barang-masuk', validateBarangMasuk, barangMasuk.storeBarangMasuk);
router.delete('/barang-masuk/:id', barangMasuk.deleteBarangMasuk);

// barang keluar
router.get('/barang-keluar', barangKeluar.findBarangKeluar);
router.post('/barang-keluar', validateBarangKeluar, barangKeluar.storeBarangKeluar);
router.delete('/barang-keluar/:id', barangKeluar.deleteBarangKeluar);

//export router
module.exports = router