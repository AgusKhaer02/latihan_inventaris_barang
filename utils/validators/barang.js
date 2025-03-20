const prisma = require('../../prisma/client')

// import express validator
const { body, check } = require('express-validator');

const validateBarang = [
    check('gambar')
        .custom((value, { req }) => {
            if (req.method === 'PUT' && !req.file) {
                return true;
            }
            // jika gambar tidak ada, muncul pesan berikut
            if (req.method === 'POST' && !req.file) {
                throw new Error("Image is required");
            }
            // return true, jika proses validasi custom sudah selesai
            return true;
        }),
    // ini kalo teks title atau content tidak ada, maka muncul error
    body('nama_barang').notEmpty().withMessage('Nama Barang is required'),
    body('keterangan').notEmpty().withMessage('Keterangan is required'),
];

const validateBarangKeluar = [
    // ini kalo teks title atau content tidak ada, maka muncul error
    body('jumlah').custom(async (value, { req }) => {
        // Aggregate jumlah from barangMasuk
        const barangMasuk = await prisma.barangMasuk.aggregate({
            where: { id_barang: Number(req.body.id_barang) },
            _sum: { jumlah: true }
        });

        // Aggregate jumlah from barangKeluar
        const barangKeluar = await prisma.barangKeluar.aggregate({
            where: { id_barang: Number(req.body.id_barang) },
            _sum: { jumlah: true }
        });

        const totalMasuk = barangMasuk._sum.jumlah || 0;
        const totalKeluar = barangKeluar._sum.jumlah || 0;
        const stok = totalMasuk - totalKeluar;

        if (stok < req.body.jumlah) {
            throw new Error(`Stok tidak cukup, Sisa Stok : ${stok}`);
        }


        return true;
    }),
    body('jumlah').notEmpty().withMessage('Jumlah is required'),
    body('id_barang').notEmpty().withMessage('ID Barang is required'),
];

const validateBarangMasuk = [
    // ini kalo teks title atau content tidak ada, maka muncul error
    body('jumlah').notEmpty().withMessage('Jumlah is required'),
    body('id_barang').notEmpty().withMessage('ID Barang is required'),
];


module.exports = { validateBarang, validateBarangKeluar, validateBarangMasuk }