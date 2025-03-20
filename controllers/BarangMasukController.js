const { log } = require('console')
const prisma = require('../prisma/client')

const { validationResult } = require("express-validator")

const findBarangMasuk = async (req, res) => {
    try {
        const barang = await prisma.barangMasuk.findMany({
            include: {
                barang: true,
            },
        });

        if (!barang) {
            throw new Error('Barang not found');
        }

        // kolom yang dibawah ini hanya menyebut barang masuk dan barang keluar
        // kemudian untuk sisa dari ini akan masuk ke dalam rest parameter
        const result = barang.map(({ barang, ...otherBarangMasuk }) => {
            
            return {
                nama_barang : barang.nama_barang,
                ...otherBarangMasuk
            };
        });

        res.status(200).send({
            success: true,
            message: "fetch Barang Sukses!",
            data: result
        })
    } catch (error) {
        console.error("Error :" + error);

        res.status(500).send({
            success: true,
            message: `fetch Barang Gagal!`
        })
    }
}

const storeBarangMasuk = async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Data tidak lengkap",
            errors: error.array(),
        })
    }

    var dataInput = req.body;

    try {
        const barang = await prisma.barangMasuk.create({
            data: {
                id_barang: Number(dataInput.id_barang),
                jumlah: Number(dataInput.jumlah),
                catatan: (dataInput.catatan != null) ? dataInput.catatan : "",
            }
        });

        res.status(201).send({
            success: true,
            message: "Post created successfully",
            data: barang,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: true,
            message: "Input data barang gagal!",
        });
    }
}

const deleteBarangMasuk = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //delete post
        const barang = await prisma.barangMasuk.delete({
            where: {
                id: Number(id),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: 'Barang deleted successfully',
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

};

module.exports = { findBarangMasuk, storeBarangMasuk, deleteBarangMasuk }