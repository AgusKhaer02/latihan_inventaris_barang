const { log } = require('console')
const prisma = require('../prisma/client')

const { validationResult } = require("express-validator")

const fileSystem = require("fs")

const path = require("path")

const findBarang = async (req, res) => {
    try {
        const barang = await prisma.barang.findMany({
            include: {
                barang_masuk: true,
                barang_keluar: true,
            },
        });

       

        if (!barang) {
            throw new Error('Barang not found');
        }

        // kolom yang dibawah ini hanya menyebut barang masuk dan barang keluar
        // kemudian untuk sisa dari ini akan masuk ke dalam rest parameter
        const result = barang.map(({ barang_masuk, barang_keluar, ...barangWithoutRelations }) => {
            // bisa pake ini
            // let total = 0; // Initial value
            // for (let i = 0; i < numbers.length; i++) {
            //     total += numbers[i]; // Summing values
            // }
   
            barangWithoutRelations.gambar = `http://192.168.18.178:3000/uploads/${barangWithoutRelations.gambar}`;
            // atau yg ini
            const totalMasuk = barang_masuk.reduce((sum, item) => sum + item.jumlah, 0);
            const totalKeluar = barang_keluar.reduce((sum, item) => sum + item.jumlah, 0);
            // penjelasan tentang reduce
            // array.reduce((accumulator, currentValue) => {
            //     return newAccumulatorValue;
            //   }, initialValue);

            return {
                ...barangWithoutRelations,
                stok: totalMasuk - totalKeluar
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


const detailBarang = async (req, res) => {
    const {id} = req.params;

    try {
        const barang = await prisma.barang.findUnique({
           where: {
            "id" : Number(id)
           },
           include: {
            "barang_masuk": true,
            "barang_keluar": true
            }
        });

        if (!barang) {
            throw new Error('Barang not found');
        }

        barang.gambar = `http://192.168.18.178:3000/uploads/${barang.gambar}`;
        const totalMasuk = (barang.barang_masuk || []).reduce((sum, item) => sum + item.jumlah, 0);
        const totalKeluar = (barang.barang_keluar || []).reduce((sum, item) => sum + item.jumlah, 0);
        const result = {
            ...barang,
            stok: totalMasuk - totalKeluar
        };

        const {barang_keluar, barang_masuk, ...otherBarang} = result;

        res.status(200).send({
            success: true,
            message: "fetch Barang Sukses!",
            data: otherBarang
        })
    } catch (error) {
        console.error("Error :" + error);

        res.status(500).send({
            success: true,
            message: `fetch Barang Gagal!`
        })
    }
}

const storeBarang = async (req, res) => {
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
        const barang = await prisma.barang.create({
            data: {
                nama_barang: dataInput.nama_barang,
                keterangan: dataInput.keterangan,
                gambar: req.file.filename
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

const updateBarang = async (req, res) => {

    const { id } = req.params;

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Data tidak lengkap",
            errors: error.array(),
        })
    }

    var dataInput = req.body;
    dataInput.updatedAt = new Date();

    try {
        if (req.file) {
            dataInput.gambar = req.file.filename;

            const oldBarang = await prisma.barang.findUnique({
                where: {
                    id: Number(id),
                },
            });

            if (oldBarang && oldBarang.gambar) {
                const oldImgPath = path.join(process.cwd(), 'uploads', oldBarang.gambar)

                if (fileSystem.existsSync(oldImgPath)) {
                    fileSystem.unlinkSync(oldImgPath)
                } else {
                    console.log('File tidak ditemukan:', oldImgPath);
                }
            }
        }

        const barang = await prisma.barang.update({
            where: {
                id: Number(id),
            },
            data: dataInput
        });

        res.status(201).send({
            success: true,
            message: "Barang updated successfully",
            data: barang,
        });
    } catch (error) {
        res.status(500).send({
            success: true,
            message: "Update data barang gagal!",
        });
    }
}

const findBarangByID = async (req, res) => {
    const { id } = req.params;
    try {

        //get barang by ID
        const barang = await prisma.barang.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                barang_masuk: true,
                barang_keluar: true,
            },
        });
        if (!barang) {
            throw new Error('Barang not found');
        }
        const result = barang.map(({ barang_masuk, barang_keluar, ...barangWithoutRelations }) => {

            const totalMasuk = barang_masuk.reduce((sum, item) => sum + item.jumlah, 0);
            const totalKeluar = barang_keluar.reduce((sum, item) => sum + item.jumlah, 0);
            return {
                ...barangWithoutRelations,
                stok: totalMasuk - totalKeluar
            };
        });
        //send response
        res.status(200).send({
            success: true,
            message: `Get barang By ID :${id}`,
            data: result,
        });
        
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
}

const deleteBarang = async (req, res) => {

    //get ID from params
    const { id } = req.params;

    try {

        //delete post
        const barang = await prisma.barang.delete({
            where: {
                id: Number(id),
            },
        });

        if (barang && barang.image) {
            // Bangun path lengkap ke file lama
            const imagePath = path.join(process.cwd(), 'uploads', barang.image);

            // Hapus gambar lama jika file ada
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.log('File tidak ditemukan:', imagePath);
            }
        }

        //send response
        res.status(200).send({
            success: true,
            message: 'Barang deleted successfully',
        });

    } catch (error) {
        console.error(error);
   
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

};

module.exports = { findBarang, storeBarang, updateBarang, findBarangByID, deleteBarang, detailBarang }